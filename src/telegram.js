// eslint-disable-next-line no-unused-vars
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';
import { fetchWithRetry, escapeText } from "./utils.js";

/**
 *
 * @param {string} message
 * @param {string} token
 * @param {object} context
 * @return {Promise<Response>}
 */
async function sendMessage(message, token, context) {
  const body = {
    text: message,
  };
  for (const key of Object.keys(context)) {
    if (context[key] !== undefined && context[key] !== null & key !=='temp_info') {
      body[key] = context[key];
    }
  }
  let method = 'sendMessage';
  if (context?.message_id) {
    method = 'editMessageText';
  }
  return await fetchWithRetry(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/${method}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
  const chatContext = {
    ...context,
    message_id: Array.isArray(context.message_id) ? 0 : context.message_id,
  };
  // console.log('message_id: ', context.message_id);
  let info = '';
  let origin_msg = message;
 
  const escapeContent = (parse_mode = chatContext?.parse_mode) => {
    if (parse_mode === 'MarkdownV2' && chatContext.temp_info) {

      info = '>' + (context.temp_info).replace('\n', '\n>') + '\n\n\n';
      info = escapeText(info, 'info');
      message = info + escapeText(origin_msg, 'llm');
    } else {
      info = chatContext.temp_info ?? '';
      message = info + '\n' + origin_msg;
    }
    if (context.temp_info) {
      chatContext.entities = [
        { type: 'blockquote', offset: 0, length: info.length },
      ]
    }

  }
  escapeContent();
  if (message.length <= 4096) {
    let resp = await sendMessage(message, token, chatContext);
    if (resp.status === 200) {
      return resp;
    } else {
      console.log('resp: ' + await resp.text());
      chatContext.parse_mode = null;
      context.parse_mode = null;
      escapeContent();
      resp = await sendMessage(message, token, chatContext)
      if (resp.status !== 200) {
        console.log('second bad resp: ' + await resp.text())
        chatContext.entities = []
        return await sendMessage(message, token, chatContext);
      }
      console.log('sec request ok')
      return resp;
    }
  }
  const limit = 4096;
  chatContext.parse_mode = null;
  escapeContent();
  if (!Array.isArray(context.message_id)){
    context.message_id = [context.message_id];
  }
  let msgIndex = 0;
  for (let i = 0; i < message.length; i += limit) {
    chatContext.message_id = context.message_id[msgIndex];
    const msg = message.slice(i, Math.min(i + limit, message.length));
    if (msgIndex == 0) {
      chatContext.entities.push({ type: 'blockquote', offset: info.length + 2, length: msg.length - info.length - 2 })
    } else {
      chatContext.entities[0].length = msg.length;
    }
    let resp = await sendMessage(msg, token, chatContext);
    if (resp.status == 429) {
      return resp;
    }
    msgIndex += 1;
    if (msgIndex - 1 == 0) { 
      continue; 
    }
    if (!chatContext.message_id) {
      context.message_id.push(resp.result.message_id)
    }
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
 *
 * @param {Context} context
 * @return {function(string): Promise<Response>}
 */
export function deleteMessageFromTelegramWithContext(context) {
  return async (messageId) => {
    return await fetchWithRetry(
        `${ENV.TELEGRAM_API_DOMAIN}/bot${context.SHARE_CONTEXT.currentBotToken}/deleteMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: context.CURRENT_CHAT_CONTEXT.chat_id,
            message_id: messageId,
          }),
        },
    );
  };
}


/**
 * 发送图片消息到Telegram
 *
 * @param {string | Blob} photo
 * @param {string} token
 * @param {object} context
 * @return {Promise<Response>}
 */
export async function sendPhotoToTelegram(photo, token, context) {
  const url = `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendPhoto`;
  let body = null;
  const headers = {};
  if (typeof photo === 'string') {
    body = {
      photo: photo,
    };
    for (const key of Object.keys(context)) {
      if (context[key] !== undefined && context[key] !== null) {
        body[key] = context[key];
      }
    }
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  } else {
    body = new FormData();
    body.append('photo', photo, 'photo.png');
    for (const key of Object.keys(context)) {
      if (context[key] !== undefined && context[key] !== null) {
        body.append(key, `${context[key]}`);
      }
    }
  }
  return await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: body,
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
  return await fetchWithRetry(
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
  return await fetchWithRetry(
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
    groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey)||'[]');
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
    const resp = await fetchWithRetry(
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
 * @typedef {object} BotInfo
 * @property {boolean} ok
 * @property {object} info
 * @property {string} info.name
 * @property {string} info.bot_name
 * @property {boolean} info.can_join_groups
 * @property {boolean} info.can_read_all_group_messages
 */
/**
 *
 * @param {string} token
 * @return {Promise<BotInfo>}
 */
export async function getBot(token) {
  const resp = await fetchWithRetry(
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
