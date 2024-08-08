import {DATABASE, ENV} from '../config/env.js';
import {escape} from "../utils/md2tgmd.js";
import "../types/context.js";

/**
 * @param {string} message
 * @param {string} token
 * @param {object} context
 * @returns {Promise<Response>}
 */
async function sendMessage(message, token, context) {
    const body = {
        text: message,
    };
    for (const key of Object.keys(context)) {
        if (context[key] !== undefined && context[key] !== null) {
            body[key] = context[key];
        }
    }
    let method = 'sendMessage';
    if (context?.message_id) {
        method = 'editMessageText';
    }
    return await fetch(
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
 * @param {string} message
 * @param {string} token
 * @param {CurrentChatContextType} context
 * @returns {Promise<Response>}
 */
export async function sendMessageToTelegram(message, token, context) {
    const chatContext = context;
    const originMessage = message;
    const limit = 4096;

    if (chatContext.parse_mode === 'MarkdownV2') {
        message = escape(message);
    }

    if (message.length <= limit) {
        const resp = await sendMessage(message, token, chatContext);
        if (resp.status === 200) {
            return resp;
        } else {
            message = originMessage;
            // 可能格式错乱导致发送失败，使用纯文本格式发送
            chatContext.parse_mode = null;
            return await sendMessage(message, token, chatContext);
        }
    }
    message = originMessage;
    // 拆分消息后可能导致markdown格式错乱，所以采用纯文本模式发送
    chatContext.parse_mode = null;
    let lastMessageResponse = null;
    for (let i = 0; i < message.length; i += limit) {
        const msg = message.slice(i, Math.min(i + limit, message.length));
        if (i > 0) {
            chatContext.message_id = null;
        }
        lastMessageResponse = await sendMessage(msg, token, chatContext);
    }
    return lastMessageResponse;
}

/**
 * @param {ContextType} context
 * @returns {function(string): Promise<Response>}
 */
export function sendMessageToTelegramWithContext(context) {
    return async (message) => {
        return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}

/**
 * @param {ContextType} context
 * @returns {function(string): Promise<Response>}
 */
export function deleteMessageFromTelegramWithContext(context) {
    return async (messageId) => {
        return await fetch(
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
 * @param {string | Blob} photo
 * @param {string} token
 * @param {CurrentChatContextType} context
 * @returns {Promise<Response>}
 */
export async function sendPhotoToTelegram(photo, token, context) {
    const url = `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendPhoto`;
    let body;
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
    return await fetch(url, {
            method: 'POST',
            headers,
            body,
        },
    );
}


/**
 * @param {ContextType} context
 * @returns {function(string): Promise<Response>}
 */
export function sendPhotoToTelegramWithContext(context) {
    return (url) => {
        return sendPhotoToTelegram(url, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}


/**
 * 发送聊天动作到TG
 * @param {string} action
 * @param {string} token
 * @param {string | number} chatId
 * @returns {Promise<Response>}
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
 * @param {ContextType} context
 * @returns {function(string): Promise<Response>}
 */
export function sendChatActionToTelegramWithContext(context) {
    return (action) => {
        return sendChatActionToTelegram(action, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT.chat_id);
    };
}

/**
 * @param {string} token
 * @param {string} url
 * @returns {Promise<Response>}
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

/**
 * 判断是否为群组管理员
 * @param {string | number} id
 * @param {string} groupAdminKey
 * @param {string | number} chatId
 * @param {string} token
 * @returns {Promise<string>}
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
 * 判断是否为群组管理员
 * @param {ContextType} context
 * @returns {function(*): Promise<string>}
 */
export function getChatRoleWithContext(context) {
    return (id) => {
        return getChatRole(id, context.SHARE_CONTEXT.groupAdminKey, context.CURRENT_CHAT_CONTEXT.chat_id, context.SHARE_CONTEXT.currentBotToken);
    };
}

/**
 * 获取群组管理员信息
 * @param {string | number} chatId
 * @param {string} token
 * @returns {Promise<object>}
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
 * @returns {Promise<BotInfo>}
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

/**
 * 获取文件链接
 * @param {string} fileId
 * @param {string} token
 * @returns {Promise<string>}
 */
export async function getFileLink(fileId, token) {
    const resp = await fetch(
        `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getFile`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({file_id: fileId}),
        },
    ).then((res) => res.json());
    if (resp.ok && resp.result.file_path) {
        return `https://api.telegram.org/file/bot${token}/${resp.result.file_path}`;
    }
    return '';
}
