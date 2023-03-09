import {DATABASE} from './env.js';
import {CURRENT_CHAT_CONTEXT, SHARE_CONTEXT} from './context.js';

// 发送消息到Telegram
export async function sendMessageToTelegram(message, token, context) {
  const resp = await fetch(
      `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(context || CURRENT_CHAT_CONTEXT),
          text: message,
        }),
      },
  );
  const json = await resp.json();
  if (!resp.ok) {
    return sendMessageToTelegramFallback(json, message, token, context);
  }
  return new Response(JSON.stringify(json), {
    status: 200,
    statusText: resp.statusText,
    headers: resp.headers,
  });
}
async function sendMessageToTelegramFallback(json, message, token, context) {
  if (json.description === 'Bad Request: replied message not found') {
    delete context.reply_to_message_id;
    return sendMessageToTelegram(message, token, context);
  }
  return new Response(JSON.stringify(json), {status: 200});
}

// 发送聊天动作到TG
export async function sendChatActionToTelegram(action, token) {
  return await fetch(
      `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/sendChatAction`,
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

export async function bindTelegramWebHook(token, url) {
  return await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
        }),
      },
  ).then((res) => res.json());
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
    await DATABASE.put(
        SHARE_CONTEXT.groupAdminKey,
        JSON.stringify(groupAdmin),
        {expiration: parseInt(Date.now() / 1000) + 120},
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
          token || SHARE_CONTEXT.currentBotToken
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

// 获取机器人信息
export async function getBot(token) {
  const resp = await fetch(
      `https://api.telegram.org/bot${token}/getMe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
  ).then((res) => res.json());
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
