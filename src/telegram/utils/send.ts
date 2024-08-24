import type { CurrentChatContext, WorkerContext } from '../../config/context';
import type { Telegram } from '../../types/telegram';
import type { TelegramBotAPI } from '../api/api';
import { createTelegramBotAPI } from '../api/api';

async function sendMessage(api: TelegramBotAPI, message: string, token: string, context: CurrentChatContext): Promise<Response> {
    if (context?.message_id) {
        const params: Telegram.EditMessageTextParams = {
            chat_id: context.chat_id,
            message_id: context.message_id,
            parse_mode: context.parse_mode || undefined,
            text: message,
        };
        if (context.disable_web_page_preview) {
            params.link_preview_options = {
                is_disabled: true,
            };
        }
        return api.editMessageText(params);
    } else {
        const params: Telegram.SendMessageParams = {
            chat_id: context.chat_id,
            parse_mode: context.parse_mode || undefined,
            text: message,
        };
        if (context.reply_to_message_id) {
            params.reply_parameters = {
                message_id: context.reply_to_message_id,
                chat_id: context.chat_id,
                allow_sending_without_reply: context.allow_sending_without_reply || undefined,
            };
        }
        if (context.disable_web_page_preview) {
            params.link_preview_options = {
                is_disabled: true,
            };
        }
        return api.sendMessage(params);
    };
}

async function sendLongMessage(message: string, token: string, context: CurrentChatContext): Promise<Response> {
    const chatContext = context;
    const originMessage = message;
    const limit = 4096;
    const api = createTelegramBotAPI(token);

    if (message.length <= limit) {
        const resp = await sendMessage(api, message, token, chatContext);
        if (resp.status === 200) {
            return resp;
        } else {
            message = originMessage;
            // 可能格式错乱导致发送失败，使用纯文本格式发送
            chatContext.parse_mode = null;
            return await sendMessage(api, message, token, chatContext);
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
        lastMessageResponse = await sendMessage(api, msg, token, chatContext);
        if (lastMessageResponse.status !== 200) {
            break;
        }
    }
    if (lastMessageResponse === null) {
        throw new Error('Send message failed');
    }
    return lastMessageResponse;
}

export function sendMessageToTelegramWithContext(context: WorkerContext): (message: string) => Promise<Response> {
    return async (message) => {
        return sendLongMessage(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}

export function sendPhotoToTelegramWithContext(context: WorkerContext): (photo: string | Blob) => Promise<Response> {
    return async (photo) => {
        const api = createTelegramBotAPI(context.SHARE_CONTEXT.currentBotToken);
        const chatContext = context.CURRENT_CHAT_CONTEXT;
        const params: Telegram.SendPhotoParams = {
            chat_id: chatContext.chat_id,
            photo,
        };
        if (chatContext.reply_to_message_id) {
            params.reply_parameters = {
                message_id: chatContext.reply_to_message_id,
                chat_id: chatContext.chat_id,
                allow_sending_without_reply: chatContext.allow_sending_without_reply || undefined,
            };
        }
        return api.sendPhoto(params);
    };
}
