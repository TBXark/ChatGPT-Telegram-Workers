import type * as Telegram from 'telegram-bot-api-types';
import type { TelegramBotAPI } from '../api';
import { ENV } from '../../config/env';
import { createTelegramBotAPI } from '../api';
import { escape } from './md2tgmd';

class MessageContext implements Record<string, any> {
    chat_id: number;
    message_id: number | null = null; // 当前发生的消息，用于后续编辑
    reply_to_message_id: number | null;
    parse_mode: Telegram.ParseMode | null = null;
    allow_sending_without_reply: boolean | null = null;
    disable_web_page_preview: boolean | null = null;

    constructor(message: Telegram.Message) {
        this.chat_id = message.chat.id;
        if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
            this.reply_to_message_id = message.message_id;
            this.allow_sending_without_reply = true;
        } else {
            this.reply_to_message_id = null;
        }
    }
}

export class MessageSender {
    api: TelegramBotAPI;
    context: MessageContext;

    constructor(token: string, context: MessageContext) {
        this.api = createTelegramBotAPI(token);
        this.context = context;
    }

    static from(token: string, message: Telegram.Message): MessageSender {
        return new MessageSender(token, new MessageContext(message));
    }

    with(message: Telegram.Message): MessageSender {
        this.context = new MessageContext(message);
        return this;
    }

    update(context: MessageContext | Record<string, any>): MessageSender {
        if (!this.context) {
            this.context = context as any;
            return this;
        }
        for (const key in context) {
            (this.context as any)[key] = (context as any)[key];
        }
        return this;
    }

    private async sendMessage(message: string, context: MessageContext): Promise<Response> {
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
            return this.api.editMessageText(params);
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
            return this.api.sendMessage(params);
        };
    }

    private renderMessage(parse_mode: Telegram.ParseMode | null, message: string): string {
        if (parse_mode === 'MarkdownV2') {
            return escape(message);
        }
        return message;
    }

    private async sendLongMessage(message: string, context: MessageContext): Promise<Response> {
        const chatContext = { ...context };
        const limit = 4096;
        if (message.length <= limit) {
            // 原始消息长度小于限制，直接使用当前parse_mode发送
            const resp = await this.sendMessage(this.renderMessage(context.parse_mode, message), chatContext);
            if (resp.status === 200) {
                // 发送成功，直接返回
                return resp;
            }
        }
        // 拆分消息后可能导致markdown格式错乱，所以采用纯文本模式发送,不使用任何parse_mode
        chatContext.parse_mode = null;
        let lastMessageResponse = null;
        for (let i = 0; i < message.length; i += limit) {
            const msg = message.slice(i, Math.min(i + limit, message.length));
            if (i > 0) {
                chatContext.message_id = null;
            }
            lastMessageResponse = await this.sendMessage(msg, chatContext);
            if (lastMessageResponse.status !== 200) {
                break;
            }
        }
        if (lastMessageResponse === null) {
            throw new Error('Send message failed');
        }
        return lastMessageResponse;
    }

    sendRichText(message: string, parseMode: Telegram.ParseMode | null = (ENV.DEFAULT_PARSE_MODE as Telegram.ParseMode)): Promise<Response> {
        if (!this.context) {
            throw new Error('Message context not set');
        }
        return this.sendLongMessage(message, {
            ...this.context,
            parse_mode: parseMode,
        });
    }

    sendPlainText(message: string): Promise<Response> {
        if (!this.context) {
            throw new Error('Message context not set');
        }
        return this.sendLongMessage(message, {
            ...this.context,
            parse_mode: null,
        });
    }

    sendPhoto(photo: string | Blob): Promise<Response> {
        if (!this.context) {
            throw new Error('Message context not set');
        }
        const params: Telegram.SendPhotoParams = {
            chat_id: this.context.chat_id,
            photo,
        };
        if (this.context.reply_to_message_id) {
            params.reply_parameters = {
                message_id: this.context.reply_to_message_id,
                chat_id: this.context.chat_id,
                allow_sending_without_reply: this.context.allow_sending_without_reply || undefined,
            };
        }
        return this.api.sendPhoto(params);
    }
}
