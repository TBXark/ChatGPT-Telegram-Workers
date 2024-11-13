import type * as Telegram from 'telegram-bot-api-types';
import type { AgentUserConfig } from './env';
import { ENV } from './env';
import { ConfigMerger } from './merger';

export class ShareContext {
    botId: number;
    botToken: string;
    botName: string | null = null;

    // KV 保存的键
    chatHistoryKey: string;
    lastMessageKey: string;
    configStoreKey: string;
    groupAdminsKey?: string;

    constructor(token: string, update: UpdateContext) {
        const botId = Number.parseInt(token.split(':')[0]);

        const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
        if (telegramIndex === -1) {
            throw new Error('Token not allowed');
        }
        if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
            this.botName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
        }

        this.botToken = token;
        this.botId = botId;
        const id = update.chatID;
        if (id === undefined || id === null) {
            throw new Error('Chat id not found');
        }
        // message_id每次都在变的。
        // 私聊消息中：
        //   message.chat.id 是发言人id
        // 群组消息中：
        //   message.chat.id 是群id
        //   message.from.id 是发言人id
        // 没有开启群组共享模式时，要加上发言人id
        //  chatHistoryKey = history:chat_id:bot_id:(from_id)
        //  configStoreKey =  user_config:chat_id:bot_id:(from_id)

        let historyKey = `history:${id}`;
        let configStoreKey = `user_config:${id}`;

        if (botId) {
            historyKey += `:${botId}`;
            configStoreKey += `:${botId}`;
        }
        // 标记群组消息
        switch (update.chatType) {
            case 'group':
            case 'supergroup':
                if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && update.fromUserID) {
                    historyKey += `:${update.fromUserID}`;
                    configStoreKey += `:${update.fromUserID}`;
                }
                this.groupAdminsKey = `group_admin:${id}`;
                break;
            default:
                break;
        }

        // 判断是否为话题模式
        if (update.isForum && update.isTopicMessage) {
            if (update.messageThreadID) {
                historyKey += `:${update.messageThreadID}`;
                configStoreKey += `:${update.messageThreadID}`;
            }
        }

        this.chatHistoryKey = historyKey;
        this.lastMessageKey = `last_message_id:${historyKey}`;
        this.configStoreKey = configStoreKey;
    }
}

export class WorkerContext {
    // 用户配置
    USER_CONFIG: AgentUserConfig;
    SHARE_CONTEXT: ShareContext;

    constructor(USER_CONFIG: AgentUserConfig, SHARE_CONTEXT: ShareContext) {
        this.USER_CONFIG = USER_CONFIG;
        this.SHARE_CONTEXT = SHARE_CONTEXT;
    }

    static async from(token: string, update: Telegram.Update): Promise<WorkerContext> {
        const context = new UpdateContext(update);
        const SHARE_CONTEXT = new ShareContext(token, context);
        const USER_CONFIG = Object.assign({}, ENV.USER_CONFIG);
        try {
            const userConfig: AgentUserConfig = JSON.parse(await ENV.DATABASE.get(SHARE_CONTEXT.configStoreKey));
            ConfigMerger.merge(USER_CONFIG, ConfigMerger.trim(userConfig, ENV.LOCK_USER_CONFIG_KEYS) || {});
        } catch (e) {
            console.warn(e);
        }
        return new WorkerContext(USER_CONFIG, SHARE_CONTEXT);
    }
}

class UpdateContext {
    fromUserID?: number;
    chatID?: number;
    chatType?: string;

    isForum?: boolean;
    isTopicMessage?: boolean;
    messageThreadID?: number;

    constructor(update: Telegram.Update) {
        if (update.message) {
            this.fromUserID = update.message.from?.id;
            this.chatID = update.message.chat.id;
            this.chatType = update.message.chat.type;
            this.isForum = update.message.chat.is_forum;
            this.isTopicMessage = update.message.is_topic_message;
            this.messageThreadID = update.message.message_thread_id;
        } else if (update.callback_query) {
            this.fromUserID = update.callback_query.from.id;
            this.chatID = update.callback_query.message?.chat.id;
            this.chatType = update.callback_query.message?.chat.type;
            this.isForum = update.callback_query.message?.chat.is_forum;
            // this.isTopicMessage = update.callback_query.message?.is_topic_message; // unsupported
            // this.messageThreadID = update.callback_query.message?.message_thread_id; // unsupported
        } else {
            console.error('Unknown update type');
        }
    }
}
