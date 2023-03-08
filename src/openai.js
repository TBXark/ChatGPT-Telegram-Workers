import {USER_CONFIG, SHARE_CONTEXT} from './context.js';
import {ENV, DATABASE} from './env.js';

// 发送消息到ChatGPT
export async function sendMessageToChatGPT(message, history) {
  try {
    const body = {
      model: 'gpt-3.5-turbo',
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
      return `OpenAI API 错误\n> ${resp.error.message}}`;
    }
    setTimeout(() => updateBotUsage(resp.usage), 0);
    return resp.choices[0].message.content;
  } catch (e) {
    console.error(e);
    return `我不知道该怎么回答\n> ${e.message}}`;
  }
}

// 更新当前机器人的用量统计
async function updateBotUsage(usage) {
  let dbValue = await DATABASE.get(SHARE_CONTEXT.usageKey).then((res) => JSON.parse(res));

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
