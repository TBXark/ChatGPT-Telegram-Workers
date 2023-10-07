/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';

/**
 * 从流数据中提取内容
 * @param {string} stream
 * @return {{pending: string, content: string}}
 */
function extractContentFromStreamData(stream) {
  const line = stream.split('\n');
  let remainingStr = '';
  let contentStr = '';
  for (const l of line) {
    try {
      if (l.startsWith('data:') && l.endsWith('}')) {
        const data = JSON.parse(l.substring(5));
        contentStr += data.choices[0].delta?.content || '';
      } else {
        remainingStr = l;
      }
    } catch (e) {
      remainingStr = l;
    }
  }
  return {
    content: contentStr,
    pending: remainingStr,
  };
}

/**
 * @return {boolean}
 * @param {Context} context
 */
export function isOpenAIEnable(context) {
  const key = context.openAIKeyFromContext();
  return key && key.length > 0;
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
    model: ENV.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
    stream: onStream != null,
  };

  const controller = new AbortController();
  const {signal} = controller;
  const timeout = 1000 * 60 * 5;
  setTimeout(() => controller.abort(), timeout);

  let url = `${ENV.OPENAI_API_DOMAIN}/v1/chat/completions`;
  let header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }
  if (ENV.AZURE_COMPLETIONS_API) {
    url = ENV.AZURE_COMPLETIONS_API;
    header['api-key'] = key
    delete header['Authorization']
    delete body.model
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(body),
    signal,
  });
  if (onStream && resp.ok && resp.headers.get('content-type').indexOf('text/event-stream') !== -1) {
    const reader = resp.body.getReader({mode: 'byob'});
    const decoder = new TextDecoder('utf-8');
    let data = {done: false};
    let pendingText = '';
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    while (data.done === false) {
      try {
        data = await reader.readAtLeast(4096, new Uint8Array(5000));
        pendingText += decoder.decode(data.value);
        const content = extractContentFromStreamData(pendingText);
        pendingText = content.pending;
        lengthDelta += content.content.length;
        contentFull = contentFull + content.content;
        if (lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 5;
          await onStream(`${contentFull}\n${ENV.I18N.message.loading}...`);
        }
      } catch (e) {
        contentFull += `\n\n[ERROR]: ${e.message}\n\n`;
        break;
      }
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
 * 请求ChatGPT生成图片
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
  const key = context.openAIKeyFromContext();
  const body = {
    prompt: prompt,
    n: 1,
    size: '512x512',
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/images/generations`, {
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
