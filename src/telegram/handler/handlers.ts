import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';
import { handleCommandMessage } from '../command';
import { MessageSender } from '../utils/send';
import { isTelegramChatTypeGroup } from '../utils/utils';
import { ENV } from '../../config/env';
import type { MessageHandler } from './types';

export class SaveLastMessage implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.DEBUG_MODE) {
            return null;
        }
        const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
        await ENV.DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
        return null;
    };
}

export class OldMessageFilter implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.SAFE_MODE) {
            return null;
        }
        let idList = [];
        try {
            idList = JSON.parse(await ENV.DATABASE.get(context.SHARE_CONTEXT.lastMessageKey).catch(() => '[]')) || [];
        } catch (e) {
            console.error(e);
        }
        // 保存最近的100条消息，如果存在则忽略，如果不存在则保存
        if (idList.includes(message.message_id)) {
            throw new Error('Ignore old message');
        } else {
            idList.push(message.message_id);
            if (idList.length > 100) {
                idList.shift();
            }
            await ENV.DATABASE.put(context.SHARE_CONTEXT.lastMessageKey, JSON.stringify(idList));
        }
        return null;
    };
}

export class EnvChecker implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.DATABASE) {
            return MessageSender
                .from(context.SHARE_CONTEXT.botToken, message)
                .sendPlainText('DATABASE Not Set');
        }
        return null;
    };
}

export class WhiteListFilter implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (ENV.I_AM_A_GENEROUS_PERSON) {
            return null;
        }
        const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
        const text = `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${message.chat.id}`;

        // 判断私聊消息
        if (message.chat.type === 'private') {
            // 白名单判断
            if (!ENV.CHAT_WHITE_LIST.includes(`${message.chat.id}`)) {
                return sender.sendPlainText(text);
            }
            return null;
        }

        // 判断群组消息
        if (isTelegramChatTypeGroup(message.chat.type)) {
            // 未打开群组机器人开关,直接忽略
            if (!ENV.GROUP_CHAT_BOT_ENABLE) {
                throw new Error('Not support');
            }
            // 白名单判断
            if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${message.chat.id}`)) {
                return sender.sendPlainText(text);
            }
            return null;
        }

        return sender.sendPlainText(
            `Not support chat type: ${message.chat.type}`,
        );
    };
}

export class MessageFilter implements MessageHandler {
    // eslint-disable-next-line unused-imports/no-unused-vars
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (message.text) {
            return null;// 纯文本消息
        }
        if (message.caption) {
            return null;// 图文消息
        }
        if (message.photo) {
            return null;// 图片消息
        }
        throw new Error('Not supported message type');
    };
}

export class CommandHandler implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (message.text || message.caption) {
            return await handleCommandMessage(message, context);
        }
        // 非文本消息不作处理
        return null;
    };
}
