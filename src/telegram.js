// eslint-disable-next-line no-unused-vars
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';

/**
 *
 * @param {string} message
 * @param {string} token
 * @param {object} context
 * @return {Promise<Response>}
 */
async function sendMessage(message, token, context) {
  return await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...context,
          text: message,
        }),
      },
  );
}


/**
 *
 * @param {string} message
 * @param {string} token
 * @param {object} context
 * @return {Promise<Response>}
 */
export async function sendMessageToTelegram(message, token, context) {
  console.log('Send Message:\n', message);
  const chatContext = context;
  if (message.length<=4096) {
    const resp = await sendMessage(message, token, chatContext);
    if (resp.status === 200) {
      return resp;
    } else {
      // 继续尝试用HTML发送
      // {"ok":false,"error_code":400,"description":"Bad Request: can't parse entities
    }
  }
  const limit = 4000;
  chatContext.parse_mode = 'HTML';
  for (let i = 0; i < message.length; i += limit) {
    const msg = message.slice(i, i + limit);
    await sendMessage(`<pre>\n${msg}\n</pre>`, token, chatContext);
  }
  return new Response('Message batch send', {status: 200});
}

/**
 *
 * @param {Context} context
 * @return {function(string): Promise<Response>}
 */
export function sendMessageToTelegramWithContext(context) {
  return async (message) => {
    return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
  };
}


/**
 * 发送图片消息到Telegram
 *
 * @param {string} url
 * @param {string} token
 * @param {object} context
 * @return {Promise<Response>}
 */
export async function sendPhotoToTelegram(url, token, context) {
  return await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendPhoto`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...context,
          photo: url,
          parse_mode: null,
        }),
      },
  );
}

/**
 *
 * @param {Context} context
 * @return {function(string): Promise<Response>}
 */
export function sendPhotoToTelegramWithContext(context) {
  return (url) => {
    return sendPhotoToTelegram(url, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
  };
}


/**
 * 发送聊天动作到TG
 *
 * @param {string} action
 * @param {string} token
 * @param {string | number} chatId
 *
 * @return {Promise<Response>}
 */
export async function sendChatActionToTelegram(action, token, chatId) {
  return await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendChatAction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          action: action,
        }),
      },
  ).then((res) => res.json());
}

/**
 *
 * @param {Context} context
 * @return {function(string): Promise<Response>}
 */
export function sendChatActionToTelegramWithContext(context) {
  return (action) => {
    return sendChatActionToTelegram(action, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT.chat_id);
  };
}

/**
 *
 * @param {string} token
 * @param {string} url
 * @return {Promise<Response>}
 */
export async function bindTelegramWebHook(token, url) {
  return await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/setWebhook`,
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
/**
 *
 * @param {string | number} id
 * @param {string} groupAdminKey
 * @param {string | number} chatId
 * @param {string} token
 * @return {Promise<string>}
 */
export async function getChatRole(id, groupAdminKey, chatId, token) {
  let groupAdmin;
  try {
    groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
  } catch (e) {
    console.error(e);
    return e.message;
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(chatId, token);
    if (administers == null) {
      return null;
    }
    groupAdmin = administers;
    // 缓存120s
    await DATABASE.put(
        groupAdminKey,
        JSON.stringify(groupAdmin),
        {expiration: (Date.now() / 1000) + 120},
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

/**
 * @param {Context} context
 * @return {function(*): Promise<string>}
 */
export function getChatRoleWithContext(context) {
  return (id) => {
    return getChatRole(id, context.SHARE_CONTEXT.groupAdminKey, context.CURRENT_CHAT_CONTEXT.chat_id, context.SHARE_CONTEXT.currentBotToken);
  };
}

/**
 * 获取群组管理员信息
 *
 * @param {string | number} chatId
 * @param {string} token
 * @return {Promise<object>}
 */
export async function getChatAdminister(chatId, token) {
  try {
    const resp = await fetch(
        `${ENV.TELEGRAM_API_DOMAIN}/bot${
          token
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
/**
 *
 * @param {string} token
 * @return {Promise<object>}
 */
export async function getBot(token) {
  const resp = await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getMe`,
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
