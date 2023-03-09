import {USER_CONFIG, SHARE_CONTEXT} from './context.js';
import {ENV, DATABASE} from './env.js';

// 发送消息到ChatGPT
export async function sendMessageToChatGPT(message, history) {
  const body = {
    model: ENV.CHAT_MODEL,
    ...USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
  };
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
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
  setTimeout(() => updateBotUsage(resp.usage).catch(console.error), 0);
  return resp.choices[0].message.content;
}

// 更新当前机器人的用量统计
async function updateBotUsage(usage) {
  let dbValue = JSON.parse(await DATABASE.get(SHARE_CONTEXT.usageKey));

  if (!dbValue) {
    dbValue = {
      tokens: {
        total: 0,
        chats: {},
      },
    };
  }

  dbValue.tokens.total += usage.total_tokens;
  if (!dbValue.tokens.chats[SHARE_CONTEXT.chatId]) {
    dbValue.tokens.chats[SHARE_CONTEXT.chatId] = usage.total_tokens;
  } else {
    dbValue.tokens.chats[SHARE_CONTEXT.chatId] += usage.total_tokens;
  }

  await DATABASE.put(SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}
