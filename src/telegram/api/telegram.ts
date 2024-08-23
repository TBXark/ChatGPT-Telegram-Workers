import { ENV } from '../../config/env';
import type { CurrentChatContext, WorkerContext } from '../../config/context';
import type { TelegramWebhookRequest } from '../../types/telegram';
import { escape } from '../utils/md2tgmd';

// Telegram函数
// 1. 需要判断请求状态的返回Promise<Response>
// 2. 无需判断请求结果的返回Promise<Response>
// 3. 有具体数据处理需求的返回具体数据类型的Promise
// 4. 默认返回Promise<Response>

async function sendTelegramRequest(method: string, token: string, body: FormData | object | null = null): Promise<Response> {
    const headers: Record<string, string> = {};
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

async function sendMessage(message: string, token: string, context: CurrentChatContext): Promise<Response> {
    const body: Record<string, any> = {
        text: message,
    };
    for (const [key, value] of Object.entries(context)) {
        if (value !== undefined && value !== null) {
            body[key] = value;
        }
    }
    let method = 'sendMessage';
    if (context?.message_id) {
        method = 'editMessageText';
    }
    return sendTelegramRequest(method, token, body);
}

export async function sendMessageToTelegram(message: string, token: string, context: CurrentChatContext): Promise<Response> {
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
    if (lastMessageResponse === null) {
        throw new Error('Send message failed');
    }
    return lastMessageResponse;
}

export async function sendPhotoToTelegram(photo: string | Blob, token: string, context: CurrentChatContext): Promise<Response> {
    if (typeof photo === 'string') {
        const body: Record<string, any> = {
            photo,
        };
        for (const [key, value] of Object.entries(context)) {
            if (value !== undefined && value !== null) {
                body[key] = value;
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    } else {
        const body = new FormData();
        body.append('photo', photo, 'photo.png');
        for (const [key, value] of Object.entries(context)) {
            if (value !== undefined && value !== null) {
                body.append(key, `${value}`);
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    }
}

export async function sendChatActionToTelegram(action: string, token: string, chatId: number): Promise<Response> {
    return sendTelegramRequest('sendChatAction', token, {
        chat_id: chatId,
        action,
    });
}

export async function bindTelegramWebHook(token: string, url: string): Promise<Response> {
    return sendTelegramRequest('setWebhook', token, { url });
}

export async function deleteTelegramWebHook(token: string): Promise<Response> {
    return sendTelegramRequest('deleteWebhook', token);
}

export async function getTelegramUpdates(token: string, offset: number): Promise<{ result: TelegramWebhookRequest[] }> {
    return sendTelegramRequest('getUpdates', token, { offset })
        .then(res => res.json()) as any;
}

export async function getChatAdministrators(chatId: number, token: string): Promise<{ result: any[] }> {
    return sendTelegramRequest('getChatAdministrators', token, { chat_id: chatId })
        .then(res => res.json()).catch(() => null) as any;
}

export async function getBotName(token: string): Promise<string> {
    const { result: { username } } = await sendTelegramRequest('getMe', token)
        .then(res => res.json()) as any;
    return username;
}

export async function getFileLink(fileId: string, token: string): Promise<string> {
    try {
        const { result: { file_path } } = await sendTelegramRequest('getFile', token, { file_id: fileId })
            .then(res => res.json()) as any;
        return `https://api.telegram.org/file/bot${token}/${file_path}`;
    } catch (e) {
        console.error(e);
    }
    return '';
}

export async function setMyCommands(config: any, token: string): Promise<Response> {
    return sendTelegramRequest('setMyCommands', token, config);
}

export function sendMessageToTelegramWithContext(context: WorkerContext): (message: string) => Promise<Response> {
    return async (message) => {
        return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}

export function sendPhotoToTelegramWithContext(context: WorkerContext): (photo: string | Blob) => Promise<Response> {
    return (photo) => {
        return sendPhotoToTelegram(photo, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}

export function sendChatActionToTelegramWithContext(context: WorkerContext): (action: string) => Promise<Response> {
    return (action) => {
        return sendChatActionToTelegram(action, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT.chat_id);
    };
}
