import type { Telegram } from '../types/telegram';
import { DATABASE, ENV, mergeEnvironment } from './env';
import type { AgentUserConfig } from './config';

export class ShareContext {
    botId: number;
    botToken: string;
    botName: string | null = null;

    // KV 保存的键
    chatHistoryKey: string;
    lastMessageKey: string;
    configStoreKey: string;
    groupAdminsKey?: string;

    constructor(token: string, message: Telegram.Message) {
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
        const id = message?.chat?.id;
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
        switch (message.chat.type) {
            case 'group':
            case 'supergroup':
                if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from?.id) {
                    historyKey += `:${message.from.id}`;
                    configStoreKey += `:${message.from.id}`;
                }
                this.groupAdminsKey = `group_admin:${id}`;
                break;
            default:
                break;
        }

        // 判断是否为话题模式
        if (message?.chat.is_forum && message?.is_topic_message) {
            if (message?.message_thread_id) {
                historyKey += `:${message.message_thread_id}`;
                configStoreKey += `:${message.message_thread_id}`;
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

    static async from(token: string, message: Telegram.Message): Promise<WorkerContext> {
        const SHARE_CONTEXT = new ShareContext(token, message);
        const USER_CONFIG = Object.assign({}, ENV.USER_CONFIG);
        try {
            const userConfig: AgentUserConfig = JSON.parse(await DATABASE.get(SHARE_CONTEXT.configStoreKey));
            mergeEnvironment(USER_CONFIG, userConfig?.trim(ENV.LOCK_USER_CONFIG_KEYS) || {});
        } catch (e) {
            console.warn(e);
        }
        return new WorkerContext(USER_CONFIG, SHARE_CONTEXT);
    }
}
