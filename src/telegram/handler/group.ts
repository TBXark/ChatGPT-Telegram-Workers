import type { User } from 'telegram-bot-api-types';
import type { Telegram, TelegramAPISuccess } from '../../types/telegram';
import type { WorkerContext } from '../../config/context';
import { isTelegramChatTypeGroup } from '../utils/utils';
import { ENV } from '../../config/env';
import { createTelegramBotAPI } from '../api/api';
import type { MessageHandler } from './type';

function checkMention(content: string, entities: Telegram.MessageEntity[], botName: string, botId: number): {
    isMention: boolean;
    content: string;
} {
    let isMention = false;
    for (const entity of entities) {
        const entityStr = content.slice(entity.offset, entity.offset + entity.length);
        switch (entity.type) {
            case 'mention': // "mention"适用于有用户名的普通用户
                if (entityStr === `@${botName}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'text_mention': // "text_mention"适用于没有用户名的用户或需要通过ID提及用户的情况
                if (`${entity.user?.id}` === `${botId}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'bot_command': // "bot_command"适用于命令
                if (entityStr.endsWith(`@${botName}`)) {
                    isMention = true;
                    const newEntityStr = entityStr.replace(`@${botName}`, '');
                    content = content.slice(0, entity.offset) + newEntityStr + content.slice(entity.offset + entity.length);
                }
                break;
            default:
                break;
        }
    }
    return {
        isMention,
        content,
    };
}

export class GroupMention implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        // 非群组消息不作判断，交给下一个中间件处理
        if (!isTelegramChatTypeGroup(context.SHARE_CONTEXT.chatType)) {
            return null;
        }

        // 处理回复消息, 如果回复的是当前机器人的消息交给下一个中间件处理
        if (message.reply_to_message) {
            if (`${message.reply_to_message.from?.id}` === `${context.SHARE_CONTEXT.currentBotId}`) {
                return null;
            } else if (ENV.EXTRA_MESSAGE_CONTEXT) {
                context.SHARE_CONTEXT.extraMessageContext = message.reply_to_message;
            }
        }

        // 处理群组消息，过滤掉AT部分
        let botName = context.SHARE_CONTEXT.currentBotName;
        if (!botName) {
            const res = await createTelegramBotAPI(context.SHARE_CONTEXT.currentBotToken).getMe().then(res => res.json()) as TelegramAPISuccess<User>;
            botName = res.result.username || null;
            context.SHARE_CONTEXT.currentBotName = botName;
        }
        if (!botName) {
            throw new Error('Not set bot name');
        }
        let isMention = false;
        // 检查text中是否有机器人的提及
        if (message.text && message.entities) {
            const res = checkMention(message.text, message.entities, botName, context.SHARE_CONTEXT.currentBotId);
            isMention = res.isMention;
            message.text = res.content.trim();
        }
        // 检查caption中是否有机器人的提及
        if (message.caption && message.caption_entities) {
            const res = checkMention(message.caption, message.caption_entities, botName, context.SHARE_CONTEXT.currentBotId);
            isMention = res.isMention || isMention;
            message.caption = res.content.trim();
        }
        if (!isMention) {
            throw new Error('Not mention');
        }
        return null;
    };
}
