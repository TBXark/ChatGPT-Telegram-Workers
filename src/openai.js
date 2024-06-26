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
  const url = `${ENV.OPENAI_API_BASE}/chat/completions`;

  const body = {
    model: context.USER_CONFIG.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
    stream: onStream != null,
  };

  const header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
  };

  return requestCompletionsFromOpenAICompatible(url, header, body, context, onStream, (result) => {
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

  return requestCompletionsFromOpenAICompatible(url, header, body, context, onStream);
}


/**
* 发送请求到兼容OpenAI的API
*
* @param {string | null} url
* @param {object} header
* @param {object} body
* @param {Context} context
* @param {function} onStream
* @param {function} onResult
* @return {Promise<string>}
*/
export async function requestCompletionsFromOpenAICompatible(url, header, body, context, onStream, onResult = null) {
  const controller = new AbortController();
  const {signal} = controller;
  const timeout = 1000 * 60 * 5;
  setTimeout(() => controller.abort(), timeout);

  let firstTimeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    firstTimeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`No response in ${ENV.CHAT_TIMEOUT}s`));
    }, ENV.CHAT_TIMEOUT * 1000);
  });

  const resp = await Promise.race([timeoutPromise, fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(body),
    signal,
  })]);
  clearTimeout(firstTimeoutId);

  if (onStream && resp.ok && isEventStreamResponse(resp)) {
    const stream = new Stream(resp, controller);
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    let msgPromise = null;
    let lastChunk = null;
    const immediatePromise = Promise.resolve('immediate'); 
    try {
      for await (const data of stream) {
        const c = data?.choices?.[0]?.delta?.content || '';
        lengthDelta += c.length;
        // 不再发送发送最后一个chunk, 由上层消息处理
        if (lastChunk) contentFull = contentFull + lastChunk;
        if (lastChunk && lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 10;
          if (!msgPromise || (await Promise.race([msgPromise, immediatePromise])) !== 'immediate') {
            msgPromise = onStream(`${contentFull}\n\n${ENV.I18N.message.loading}...`);
          }
        }
        lastChunk = c;
      }
    } catch (e) {
      contentFull += `\nERROR: ${e.message}`;
    }
    contentFull += lastChunk;
    // 防止上次消息未结束导致后续消息被覆盖
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
  let url = `${ENV.OPENAI_API_BASE}/images/generations`;
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
    const provider = context.USER_CONFIG.AI_IMAGE_PROVIDER;
    let isAzureModel = false;
    switch (provider) {
      case 'azure':
        isAzureModel = true;
        break;
      case 'openai':
        isAzureModel = false;
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
