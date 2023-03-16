/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';

/**
 * 发送消息到ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestCompletionsFromChatGPT(message, history, context) {
  console.log(`requestCompletionsFromChatGPT: ${message}`);
  const body = {
    model: ENV.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENV.API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    if (ENV.DEV_MODE || ENV.DEV_MODE) {
      throw new Error(`OpenAI API 错误\n> ${resp.error.message}\n参数: ${JSON.stringify(body)}`);
    } else {
      throw new Error(`OpenAI API 错误\n> ${resp.error.message}`);
    }
  }
  setTimeout(() => updateBotUsage(resp.usage, context).catch(console.error), 0);
  return resp.choices[0].message.content;
}


/**
 * 请求ChatGPT生成图片
 * @param {string} prompt
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt) {
  console.log(`requestImageFromOpenAI: ${prompt}`);
  const body = {
    prompt: prompt,
    n: 1,
    size: '512x512',
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENV.API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API 错误\n> ${resp.error.message}`);
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
