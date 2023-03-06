import {DATABASE} from './env.js';
import {ENV} from './env.js';
import {CURRENR_CHAT_CONTEXT, SHARE_CONTEXT} from './context';

// 发送消息到Telegram
export async function sendMessageToTelegram(message, token, context) {
  return await fetch(
      `https://api.telegram.org/bot${token || ENV.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(context || CURRENR_CHAT_CONTEXT),
          text: message,
        }),
      },
  );
}

// 判断是否为群组管理员
export async function getChatRole(id) {
  let groupAdmin;
  try {
    groupAdmin = await DATABASE.get(SHARE_CONTEXT.groupAdminKey).then((res) =>
      JSON.parse(res),
    );
  } catch (e) {
    console.error(e);
    return e.message;
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(CURRENR_CHAT_CONTEXT.chat_id);
    if (administers == null) {
      return null;
    }
    groupAdmin = administers;
    // 缓存30s
    await DATABASE.put(
        SHARE_CONTEXT.groupAdminKey,
        JSON.stringify(groupAdmin),
        {expiration: Date.now() + 30000},
    );
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
        `https://api.telegram.org/bot${
          token || ENV.TELEGRAM_TOKEN
        }/getChatAdministrators`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({chat_id: chatId}),
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

// 发送聊天动作到TG
export async function sendChatActionToTelegram(action, token) {
  return await fetch(
      `https://api.telegram.org/bot${token || ENV.TELEGRAM_TOKEN}/sendChatAction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CURRENR_CHAT_CONTEXT.chat_id,
          action: action||'typing',
        }),
      },
  );
}
