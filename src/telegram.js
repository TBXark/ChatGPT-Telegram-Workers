/* eslint-disable indent */
import { DATABASE, ENV } from './env.js';
import { CURRENT_CHAT_CONTEXT, SHARE_CONTEXT } from './context.js';

// 发送消息到Telegram
async function sendMessage(message, token, context) {
  return await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...context,
      text: message,
    }),
  });
}

// 发送消息到Telegram
export async function sendMessageToTelegram(message, token, context) {
  console.log('发送消息:\n', message);
  const botToken = token || SHARE_CONTEXT.currentBotToken;
  const chatContext = context || CURRENT_CHAT_CONTEXT;
  if (message.length <= 4096) {
    return await sendMessage(message, botToken, chatContext);
  }
  console.log('消息将分段发送');
  const limit = 4000;
  chatContext.parse_mode = 'HTML';
  for (let i = 0; i < message.length; i += limit) {
    const msg = message.slice(i, i + limit);
    await sendMessage(`<pre>\n${msg}\n</pre>`, botToken, chatContext);
  }
  return new Response('MESSAGE BATCH SEND', { status: 200 });
}

// 发送图片消息到Telegram
export async function sendPhotoToTelegram(url, token, context) {
  const chatContext = Object.assign(context || CURRENT_CHAT_CONTEXT, { parse_mode: null });
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token || SHARE_CONTEXT.currentBotToken}/sendPhoto`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...chatContext,
        photo: url,
      }),
    },
  );
}

// 发送聊天动作到TG
export async function sendChatActionToTelegram(action, token) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token || SHARE_CONTEXT.currentBotToken}/sendChatAction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CURRENT_CHAT_CONTEXT.chat_id,
        action: action,
      }),
    },
  ).then((res) => res.json());
}

export async function deleteMessageInlineKeyboard(chatId, messageId, token) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${
      token || SHARE_CONTEXT.currentBotToken
    }/editMessageReplyMarkup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [],
        },
      }),
    },
  ).then((res) => res.json());
}

export async function bindTelegramWebHook(token, url) {
  return await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/setWebhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
    }),
  }).then((res) => res.json());
}

// 判断是否为群组管理员
export async function getChatRole(id) {
  let groupAdmin;
  try {
    groupAdmin = JSON.parse(await DATABASE.get(SHARE_CONTEXT.groupAdminKey));
  } catch (e) {
    console.error(e);
    return e.message;
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(CURRENT_CHAT_CONTEXT.chat_id);
    if (administers == null) {
      return null;
    }
    groupAdmin = administers;
    // 缓存120s
    await DATABASE.put(SHARE_CONTEXT.groupAdminKey, JSON.stringify(groupAdmin), {
      expiration: parseInt(Date.now() / 1000) + 120,
    });
  }
  for (let i = 0; i < groupAdmin.length; i++) {
    const user = groupAdmin[i];
    if (user.user.id === id) {
      return user.status;
    }
  }
  return 'member';
}

// 获取群组管理员信息
export async function getChatAdminister(chatId, token) {
  try {
    const resp = await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${
        token || SHARE_CONTEXT.currentBotToken
      }/getChatAdministrators`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: chatId }),
      },
    ).then((res) => res.json());
    if (resp.ok) {
      return resp.result;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

// 获取机器人信息
export async function getBot(token) {
  const resp = await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getMe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
  if (resp.ok) {
    return {
      ok: true,
      info: {
        name: resp.result.first_name,
        bot_name: resp.result.username,
        can_join_groups: resp.result.can_join_groups,
        can_read_all_group_messages: resp.result.can_read_all_group_messages,
      },
    };
  } else {
    return resp;
  }
}
