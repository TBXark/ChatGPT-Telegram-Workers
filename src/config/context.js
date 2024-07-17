import {CONST, DATABASE, ENV, mergeEnvironment, UserConfig} from './env.js';
import '../types/telegram.js';

/**
 * @param {UserConfigType} userConfig
 * @return {object}
 */
export function trimUserConfig(userConfig) {
    const config = {
        ...userConfig
    }
    const keysSet = new Set(userConfig.DEFINE_KEYS);
    for (const key of ENV.LOCK_USER_CONFIG_KEYS) {
        keysSet.delete(key);
    }
    keysSet.add('DEFINE_KEYS');
    for (const key of Object.keys(config)) {
        if (!keysSet.has(key)) {
            delete config[key];
        }
    }
    return config;
}

/**
 * @class
 * @implements {ShareContextType}
 */
class ShareContext {
    currentBotId = null;
    currentBotToken = null;
    currentBotName = null;
    chatHistoryKey = null;
    chatLastMessageIdKey = null;
    configStoreKey = null;
    groupAdminKey = null;
    usageKey = null;
    chatType = null;
    chatId = null;
    speakerId = null;
    extraMessageContext = null;
}

/**
 * @class
 * @implements {CurrentChatContextType}
 */
class CurrentChatContext {
    chat_id = null;
    reply_to_message_id = null;
    parse_mode = ENV.DEFAULT_PARSE_MODE;
    message_id = null;
    reply_markup = null;
    allow_sending_without_reply = null;
    disable_web_page_preview = null;
}

/**
 * 上下文信息
 * @class
 * @implements {ContextType}
 */
export class Context {

    // 用户配置
    USER_CONFIG = new UserConfig();
    CURRENT_CHAT_CONTEXT = new CurrentChatContext();
    SHARE_CONTEXT = new ShareContext();

    /**
     * @inner
     * @param {string | number} chatId
     * @param {string | number} replyToMessageId
     */
    _initChatContext(chatId, replyToMessageId) {
        this.CURRENT_CHAT_CONTEXT.chat_id = chatId;
        this.CURRENT_CHAT_CONTEXT.reply_to_message_id = replyToMessageId;
        if (replyToMessageId) {
            this.CURRENT_CHAT_CONTEXT.allow_sending_without_reply = true;
        }
    }

    //
    /**
     * 初始化用户配置
     *
     * @inner
     * @param {string | null} storeKey
     */
    async _initUserConfig(storeKey) {
        try {
            // 复制默认配置
            this.USER_CONFIG = {
                ...ENV.USER_CONFIG
            }
            /**
             * @type {UserConfigType}
             */
            const userConfig = JSON.parse(await DATABASE.get(storeKey));
            mergeEnvironment(this.USER_CONFIG, trimUserConfig(userConfig));
        } catch (e) {
            console.error(e);
        }
    }


    /**
     * @param {Request} request
     */
    initTelegramContext(request) {
        const {pathname} = new URL(request.url);
        const token = pathname.match(
            /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/,
        )[1];
        const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
        if (telegramIndex === -1) {
            throw new Error('Token not allowed');
        }

        this.SHARE_CONTEXT.currentBotToken = token;
        this.SHARE_CONTEXT.currentBotId = token.split(':')[0];
        if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
            this.SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
        }
    }

    /**
     *
     * @inner
     * @param {TelegramMessage} message
     */
    async _initShareContext(message) {
        this.SHARE_CONTEXT.usageKey = `usage:${this.SHARE_CONTEXT.currentBotId}`;
        const id = message?.chat?.id;
        if (id === undefined || id === null) {
            throw new Error('Chat id not found');
        }

        /*
      message_id每次都在变的。
      私聊消息中：
        message.chat.id 是发言人id
      群组消息中：
        message.chat.id 是群id
        message.from.id 是发言人id
      没有开启群组共享模式时，要加上发言人id
       chatHistoryKey = history:chat_id:bot_id:(from_id)
       configStoreKey =  user_config:chat_id:bot_id:(from_id)
      * */

        const botId = this.SHARE_CONTEXT.currentBotId;
        let historyKey = `history:${id}`;
        let configStoreKey = `user_config:${id}`;
        let groupAdminKey = null;

        if (botId) {
            historyKey += `:${botId}`;
            configStoreKey += `:${botId}`;
        }
        // 标记群组消息
        if (CONST.GROUP_TYPES.includes(message.chat?.type)) {
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

        this.SHARE_CONTEXT.chatHistoryKey = historyKey;
        this.SHARE_CONTEXT.chatLastMessageIdKey = `last_message_id:${historyKey}`;
        this.SHARE_CONTEXT.configStoreKey = configStoreKey;
        this.SHARE_CONTEXT.groupAdminKey = groupAdminKey;

        this.SHARE_CONTEXT.chatType = message.chat?.type;
        this.SHARE_CONTEXT.chatId = message.chat.id;
        this.SHARE_CONTEXT.speakerId = message.from.id || message.chat.id;
    }

    /**
     * @param {TelegramMessage} message
     * @return {Promise<void>}
     */
    async initContext(message) {
        // 按顺序初始化上下文
        const chatId = message?.chat?.id;
        const replyId = CONST.GROUP_TYPES.includes(message.chat?.type) ? message.message_id : null;
        this._initChatContext(chatId, replyId);
        // console.log(this.CURRENT_CHAT_CONTEXT);
        await this._initShareContext(message);
        // console.log(this.SHARE_CONTEXT);
        await this._initUserConfig(this.SHARE_CONTEXT.configStoreKey);
        // console.log(this.USER_CONFIG);
    }
}
