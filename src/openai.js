import OpenAI from 'openai';
import { USER_CONFIG, SHARE_CONTEXT } from './context.js';
import { ENV, DATABASE } from './env.js';

// TODO Use OpenAI package for interaction
function newOpenAi(apiKey) {
  return !apiKey
    ? null
    : new OpenAI({
        apiKey,
      });
}

export async function requestCompletionsFromChatGPT(message, history) {
  const body = {
    model: ENV.CHAT_MODEL,
    ...USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), { role: 'user', content: message }],
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      Authorization: `Bearer ${ENV.API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(
      `OpenAI API error\n> ${resp.error.message}\ncurrent parameters: ${JSON.stringify(body)}`,
    );
  }
  setTimeout(() => updateBotUsage(resp.usage).catch(console.error), 0);
  return resp.choices[0].message.content;
}

export async function requestImageFromOpenAI(prompt) {
  const body = {
    prompt: prompt,
    n: 1,
    size: '512x512',
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      Authorization: `Bearer ${ENV.API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API 错误\n> ${resp.error.message}`);
  }
  return resp.data[0].url;
}

async function updateBotUsage(usage) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return;
  }

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
