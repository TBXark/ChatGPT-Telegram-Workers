/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';
import {Stream} from './vendors/stream.js';


/**
 * @return {boolean}
 * @param {Context} context
 */
export function isOpenAIEnable(context) {
  return context.hasValidOpenAIKey();
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
  const key = context.openAIKeyFromContext();
  const body = {
    model: context.USER_CONFIG.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
    stream: onStream != null,
  };

  const controller = new AbortController();
  const {signal} = controller;
  const timeout = 1000 * 60 * 5;
  setTimeout(() => controller.abort(), timeout);

  let url = `${ENV.OPENAI_API_BASE}/chat/completions`;
  const header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  };
  if (ENV.AZURE_COMPLETIONS_API) {
    url = ENV.AZURE_COMPLETIONS_API;
    header['api-key'] = key;
    delete header['Authorization'];
    delete body.model;
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(body),
    signal,
  });
  if (onStream && resp.ok && resp.headers.get('content-type').indexOf('text/event-stream') !== -1) {
    const stream = new Stream(resp, controller);
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    try {
      for await (const data of stream) {
        const c = data.choices[0].delta?.content || '';
        lengthDelta += c.length;
        contentFull = contentFull + c;
        if (lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 5;
          await onStream(`${contentFull}\n${ENV.I18N.message.loading}...`);
        }
      }
    } catch (e) {
      contentFull += `\nERROR: ${e.message}`;
    }
    return contentFull;
  }

  const result = await resp.json();
  if (result.error?.message) {
    if (ENV.DEBUG_MODE || ENV.DEV_MODE) {
      throw new Error(`OpenAI API Error\n> ${result.error.message}\nBody: ${JSON.stringify(body)}`);
    } else {
      throw new Error(`OpenAI API Error\n> ${result.error.message}`);
    }
  }
  setTimeout(() => updateBotUsage(result.usage, context).catch(console.error), 0);
  return result.choices[0].message.content;
}


/**
 * 请求Openai生成图片
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
  const key = context.openAIKeyFromContext();
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
  const resp = await fetch(`${ENV.OPENAI_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API Error\n> ${resp.error.message}`);
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
