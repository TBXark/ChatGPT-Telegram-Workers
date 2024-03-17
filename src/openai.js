/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';
import {isEventStreamResponse, isJsonResponse} from './utils.js';
import {Stream} from './vendors/stream.js';


/**
 * @param {Context} context
 * @return {string|null}
 */
function openAIKeyFromContext(context) {
  if (context.USER_CONFIG.OPENAI_API_KEY) {
    return context.USER_CONFIG.OPENAI_API_KEY;
  }
  if (ENV.API_KEY.length === 0) {
    return null;
  }
  return ENV.API_KEY[Math.floor(Math.random() * ENV.API_KEY.length)];
}

/**
 * @param {Context} context
 * @return {string|null}
 */
function azureKeyFromContext(context) {
  return context.USER_CONFIG.AZURE_API_KEY || ENV.AZURE_API_KEY;
}


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isOpenAIEnable(context) {
  return context.USER_CONFIG.OPENAI_API_KEY || ENV.API_KEY.length > 0;
}

/**
 * @param {Context} context
 * @return {boolean}
 */
export function isAzureEnable(context) {
  // const api = context.USER_CONFIG.AZURE_COMPLETIONS_API || ENV.AZURE_COMPLETIONS_API;
  const key = context.USER_CONFIG.AZURE_API_KEY || ENV.AZURE_API_KEY;
  return key !== null;
}


/**
 * 发送消息到ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromOpenAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.OPENAI_API_BASE}/chat/completions`;
  let model = context.USER_CONFIG.CHAT_MODEL;
  let messages = [{ role: 'user', content: message }];
  if (context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.FILE_URL) {
    model = context.USER_CONFIG.OPENAI_VISION_MODEL;
    messages[0].content = [{
      "type": "text",
      "text": message || 'what is this?'  // cluade-3-haiku model 图像识别必须带文本
    }, {
      "type": "image_url", "image_url": {
        "url": context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.FILE_URL
      }
    }];
  } else {
    messages.unshift(...(history || []));
  }
  const body = {
    model: model,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: messages,
    stream: onStream != null,
  };

  const header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
  };

  return requestCompletionsFromOpenAILikes(url, header, body, context, onStream, (result) => {
    setTimeout(() => updateBotUsage(result?.usage, context).catch(console.error), 0);
  });
}


/**
 * 发送消息到Azure ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromAzureOpenAI(message, history, context, onStream) {
  const url = context.USER_CONFIG.AZURE_COMPLETIONS_API;

  const body = {
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
    stream: onStream != null,
  };

  const header = {
    'Content-Type': 'application/json',
    'api-key': azureKeyFromContext(context),
  };

  return requestCompletionsFromOpenAILikes(url, header, body, context, onStream);
}


/**
* 发送请求到类似OpenAI的API
*
* @param {string | null} url
* @param {object} header
* @param {object} body
* @param {Context} context
* @param {function} onStream
* @param {function} onResult
* @return {Promise<string>}
*/
export async function requestCompletionsFromOpenAILikes(url, header, body, context, onStream, onResult = null) {
  const controller = new AbortController();
  const {signal} = controller;
  const timeout = 1000 * 60 * 5;
  setTimeout(() => controller.abort(), timeout);

  const resp = await fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(body),
    signal,
  });
  // const clone_resp = await resp.clone().text();

  if (onStream && resp.ok && isEventStreamResponse(resp)) {
    const stream = new Stream(resp, controller);
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    // let i = 1;
    let startTime = performance.now();
    console.log('[START] Chat with openai');
    let msgPromise;
    const immediatePromise = Promise.resolve('immediate');
    try {
      for await (const data of stream) {
        const c = data?.choices?.[0]?.delta?.content || '';
        lengthDelta += c.length;
        contentFull = contentFull + c;
        if (lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 10;
          if (!msgPromise || (await Promise.race([msgPromise, immediatePromise])) !== 'immediate') {
            msgPromise = onStream(`${contentFull}\n\n${ENV.I18N.message.loading}...`);
          }
        }
      }
    } catch (e) {
      contentFull += `\nERROR: ${e.message}`;
      console.log(`errorEnd`);
    }
    let endTime = performance.now();
    console.log(`[DONE] Chat with openai: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    await msgPromise;
    return contentFull;
  }

  if (!isJsonResponse(resp)) {
    throw new Error(resp.statusText);
  }

  const result = await resp.json();

  if (!result) {
    throw new Error('Empty response');
  }

  if (result.error?.message) {
    throw new Error(result.error.message);
  }

  try {
    onResult?.(result);
    return result.choices[0].message.content;
  } catch (e) {
    throw Error(result?.error?.message || JSON.stringify(result));
  }
}


/**
 * 请求Openai生成图片
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
  let url = `${context.USER_CONFIG.OPENAI_API_BASE}/images/generations`;
  const header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
  };
  const body = {
    prompt: prompt,
    n: 1,
    size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
    model: context.USER_CONFIG.DALL_E_MODEL,
  };
  if (body.model === 'dall-e-3') {
    body.quality = context.USER_CONFIG.DALL_E_IMAGE_QUALITY;
    body.style = context.USER_CONFIG.DALL_E_IMAGE_STYLE;
  }
  {
    const provider = context.USER_CONFIG.AI_PROVIDER;
    let isAzureModel = false;
    switch (provider) {
      case 'azure':
        isAzureModel = true;
        break;
      case 'auto':
        isAzureModel = isAzureEnable(context) && context.USER_CONFIG.AZURE_DALLE_API !== null;
        break;
      default:
        break;
    }
    if (isAzureModel) {
      url = context.USER_CONFIG.AZURE_DALLE_API;
      const validSize = ['1792x1024', '1024x1024', '1024x1792'];
      if (!validSize.includes(body.size)) {
        body.size = '1024x1024';
      }
      header['api-key'] = azureKeyFromContext(context);
      delete header['Authorization'];
      delete body.model;
    }
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(resp.error.message);
  }
  return resp.data[0].url;
}

/** 
 * 请求openai转录语音
 * @param {file} audio
 * @param {string} file_name
 * @param {Context} context
 * @return {Promise<Response>}
 */
export async function requestTranscriptionFromOpenAI(audio, file_name, context) {
  const url = `${context.USER_CONFIG.OPENAI_API_BASE}/audio/transcriptions`;
  const header = {
    // 'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    'Accept': 'application/json'
  };
  const formData = new FormData();
  formData.append('file', audio, file_name);
  formData.append('model', context.USER_CONFIG.OPENAI_STT_MODEL);
  if (context.USER_CONFIG.OPENAI_STT_EXTRA_PARAMS) {
    Object.entries(context.USER_CONFIG.OPENAI_STT_EXTRA_PARAMS).forEach(([k, v]) => {
      formData.append(k, v);
    });
  }
  formData.append('response_format', 'json');

  return await fetch(url, {
    method: 'POST',
    headers: header,
    body: formData,
    redirect: 'follow'
  }).catch(error => {
    console.log(error.message)
    return new Response(JSON.stringify({error:error.message}), { status: 503 })
  });
}

/**
 * 更新当前机器人的用量统计
 * @param {object} usage
 * @param {Context} context
 * @return {Promise<void>}
 */
async function updateBotUsage(usage, context) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return;
  }

  let dbValue = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));

  if (!dbValue) {
    dbValue = {
      tokens: {
        total: 0,
        chats: {},
      },
    };
  }

  dbValue.tokens.total += usage.total_tokens;
  if (!dbValue.tokens.chats[context.SHARE_CONTEXT.chatId]) {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] = usage.total_tokens;
  } else {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] += usage.total_tokens;
  }

  await DATABASE.put(context.SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}
