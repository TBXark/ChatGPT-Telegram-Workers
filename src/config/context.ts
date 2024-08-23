import type { TelegramMessage } from '../types/telegram';
import { TelegramConstValue } from '../types/telegram';
import { DATABASE, ENV, mergeEnvironment } from './env';
import type { AgentUserConfig } from './config';

export class ShareContext {
    currentBotId: number;
    currentBotToken: string;
    currentBotName: string | null = null;

    chatHistoryKey: string;
    chatLastMessageIdKey: string;

    configStoreKey: string;
    groupAdminKey: string | null;
    usageKey: string;

    chatType: string;
    chatId: number;
    speakerId: number;

    extraMessageContext: TelegramMessage | null = null;
    allMemberAreAdmin: boolean = false;

    constructor(token: string, message: TelegramMessage) {
        const botId = Number.parseInt(token.split(':')[0]);

        const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
        if (telegramIndex === -1) {
            throw new Error('Token not allowed');
        }
        if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
            this.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
        }

        this.currentBotToken = token;
        this.currentBotId = botId;
        this.usageKey = `usage:${botId}`;
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
        let groupAdminKey: string | null = null;

        if (botId) {
            historyKey += `:${botId}`;
            configStoreKey += `:${botId}`;
        }
        // 标记群组消息
        if (TelegramConstValue.GROUP_TYPES.includes(message.chat?.type)) {
            if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from.id) {
                historyKey += `:${message.from.id}`;
                configStoreKey += `:${message.from.id}`;
            }
            groupAdminKey = `group_admin:${id}`;
        }

        // 判断是否为话题模式
        if (message?.chat?.is_forum && message?.is_topic_message) {
            if (message?.message_thread_id) {
                historyKey += `:${message.message_thread_id}`;
                configStoreKey += `:${message.message_thread_id}`;
            }
        }

        this.chatHistoryKey = historyKey;
        this.chatLastMessageIdKey = `last_message_id:${historyKey}`;
        this.configStoreKey = configStoreKey;
        this.groupAdminKey = groupAdminKey;

        this.chatType = message.chat?.type;
        this.chatId = message.chat.id;
        this.speakerId = message.from.id || message.chat.id;
        this.allMemberAreAdmin = message?.chat?.all_members_are_administrators;
    }
}

export class CurrentChatContext {
    chat_id: number;
    message_id: number | null = null; // 当前发生的消息，用于后续编辑
    reply_to_message_id: number | null;
    parse_mode: string | null = ENV.DEFAULT_PARSE_MODE;
    reply_markup: any = null;
    allow_sending_without_reply: boolean | null = null;
    disable_web_page_preview: boolean | null = null;

    constructor(message: TelegramMessage) {
        this.chat_id = message.chat.id;
        if (TelegramConstValue.GROUP_TYPES.includes(message.chat?.type)) {
            this.reply_to_message_id = message.message_id;
            this.allow_sending_without_reply = true;
        } else {
            this.reply_to_message_id = null;
        }
    }
}

export class WorkerContext {
    // 用户配置
    USER_CONFIG: AgentUserConfig;
    CURRENT_CHAT_CONTEXT: CurrentChatContext;
    SHARE_CONTEXT: ShareContext;

    constructor(USER_CONFIG: AgentUserConfig, CURRENT_CHAT_CONTEXT: CurrentChatContext, SHARE_CONTEXT: ShareContext) {
        this.USER_CONFIG = USER_CONFIG;
        this.CURRENT_CHAT_CONTEXT = CURRENT_CHAT_CONTEXT;
        this.SHARE_CONTEXT = SHARE_CONTEXT;
    }

    static async from(token: string, message: TelegramMessage): Promise<WorkerContext> {
        const SHARE_CONTEXT = new ShareContext(token, message);
        const CURRENT_CHAT_CONTEXT = new CurrentChatContext(message);
        const USER_CONFIG = Object.assign({}, ENV.USER_CONFIG);
        try {
            const userConfig: AgentUserConfig = JSON.parse(await DATABASE.get(SHARE_CONTEXT.configStoreKey));
            mergeEnvironment(USER_CONFIG, userConfig.trim());
        } catch (e) {
            console.warn(e);
        }
        return new WorkerContext(USER_CONFIG, CURRENT_CHAT_CONTEXT, SHARE_CONTEXT);
    }
}
