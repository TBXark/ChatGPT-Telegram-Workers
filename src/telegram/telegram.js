import { ENV } from '../config/env.js';
import { escape } from '../utils/md2tgmd.js';
import '../types/context.js';
import '../types/telegram.js';

// Telegram函数
// 1. 需要判断请求状态的返回Promise<Response>
// 2. 无需判断请求结果的返回Promise<Response>
// 3. 有具体数据处理需求的返回具体数据类型的Promise
// 4. 默认返回Promise<Response>

/**
 * @param {string} method
 * @param {string} token
 * @param {object} body
 * @returns {Promise<Response>}
 */
async function sendTelegramRequest(method, token, body = null) {
    const headers = {};
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(
        `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/${method}`,
        {
            method: 'POST',
            headers,
            body: body && ((body instanceof FormData) ? body : JSON.stringify(body)),
        },
    );
}

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
    return sendTelegramRequest(method, token, body);
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
        if (lastMessageResponse.status !== 200) {
            break;
        }
    }
    return lastMessageResponse;
}

/**
 * 发送图片消息到Telegram
 * @param {string | Blob} photo
 * @param {string} token
 * @param {CurrentChatContextType} context
 * @returns {Promise<Response>}
 */
export async function sendPhotoToTelegram(photo, token, context) {
    if (typeof photo === 'string') {
        const body = {
            photo,
        };
        for (const key of Object.keys(context)) {
            if (context[key] !== undefined && context[key] !== null) {
                body[key] = context[key];
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    } else {
        const body = new FormData();
        body.append('photo', photo, 'photo.png');
        for (const key of Object.keys(context)) {
            if (context[key] !== undefined && context[key] !== null) {
                body.append(key, `${context[key]}`);
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    }
}

/**
 * 发送聊天动作到TG
 * @param {string} action
 * @param {string} token
 * @param {string | number} chatId
 * @returns {Promise<Response>}
 */
export async function sendChatActionToTelegram(action, token, chatId) {
    return sendTelegramRequest('sendChatAction', token, {
        chat_id: chatId,
        action,
    });
}

/**
 * 绑定WebHook
 * @param {string} token
 * @param {string} url
 * @returns {Promise<Response>}
 */
export async function bindTelegramWebHook(token, url) {
    return sendTelegramRequest('setWebhook', token, { url });
}

/**
 * 删除WebHook
 * @param {string} token
 * @returns {Promise<Response>}
 */
export async function deleteTelegramWebHook(token) {
    return sendTelegramRequest('deleteWebhook', token);
}

/**
 * 获取更新
 * @param {string} token
 * @param {number} offset
 * @returns {Promise<{result: TelegramWebhookRequest[]}>}
 */
export async function getTelegramUpdates(token, offset) {
    return sendTelegramRequest('getUpdates', token, { offset })
        .then(res => res.json());
}

/**
 * 获取群组管理员信息
 * @param {string | number} chatId
 * @param {string} token
 * @returns {Promise<{result: object[]}>}
 */
export async function getChatAdministrators(chatId, token) {
    return sendTelegramRequest('getChatAdministrators', token, { chat_id: chatId })
        .then(res => res.json()).catch(() => null);
}

/**
 * 获取机器人名称
 * @param {string} token
 * @returns {Promise<string>}
 */
export async function getBotName(token) {
    const { result: { username } } = await sendTelegramRequest('getMe', token)
        .then(res => res.json());
    return username;
}

/**
 * 获取文件链接
 * @param {string} fileId
 * @param {string} token
 * @returns {Promise<string>}
 */
export async function getFileLink(fileId, token) {
    try {
        const { result: { file_path } } = await sendTelegramRequest('getFile', token, { file_id: fileId })
            .then(res => res.json());
        return `https://api.telegram.org/file/bot${token}/${file_path}`;
    } catch (e) {
        console.error(e);
    }
    return '';
}

/**
 * @param {any} config
 * @param {string} token
 * @returns {Promise<Response>}
 */
export async function setMyCommands(config, token) {
    return sendTelegramRequest('setMyCommands', token, config);
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
export function sendPhotoToTelegramWithContext(context) {
    return (url) => {
        return sendPhotoToTelegram(url, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
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
