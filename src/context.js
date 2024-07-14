import {CONST, DATABASE, ENV} from './env.js';

import './type.js';


/**
 * @param {object} target - The target object.
 * @param {object} source - The source object.
 * @param {Array<string>} keys - The keys to merge.
 */
function mergeObject(target, source, keys) {
  for (const key of Object.keys(target)) {
    if (source[key]) {
      if (keys !== null && !keys.includes(key)) {
        continue;
      }
      if (typeof source[key] === typeof target[key]) {
        target[key] = source[key];
      }
    }
  }
}

/**
 * 上下文信息
 */
export class Context {
  // 用户配置
  USER_CONFIG = {
    // 自定义的配置的Key
    DEFINE_KEYS: [],

    // AI提供商
    AI_PROVIDER: ENV.AI_PROVIDER,
    // AI图片提供商
    AI_IMAGE_PROVIDER: ENV.AI_IMAGE_PROVIDER,

    // 聊天模型
    CHAT_MODEL: ENV.CHAT_MODEL,
    // OenAI API Key
    OPENAI_API_KEY: '',
    // OpenAI API 额外参数
    OPENAI_API_EXTRA_PARAMS: {},
    // 系统初始化消息
    SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,

    // DALL-E的模型名称
    DALL_E_MODEL: ENV.DALL_E_MODEL,
    // DALL-E图片尺寸
    DALL_E_IMAGE_SIZE: ENV.DALL_E_IMAGE_SIZE,
    // DALL-E图片质量
    DALL_E_IMAGE_QUALITY: ENV.DALL_E_IMAGE_QUALITY,
    // DALL-E图片风格
    DALL_E_IMAGE_STYLE: ENV.DALL_E_IMAGE_STYLE,

    // Azure API Key
    AZURE_API_KEY: ENV.AZURE_API_KEY,
    // Azure Completions API
    AZURE_COMPLETIONS_API: ENV.AZURE_COMPLETIONS_API,
    // Azure DALL-E API
    AZURE_DALLE_API: ENV.AZURE_DALLE_API,

    // WorkersAI聊天记录模型
    WORKERS_CHAT_MODEL: ENV.WORKERS_CHAT_MODEL,
    // WorkersAI图片模型
    WORKER_IMAGE_MODEL: ENV.WORKERS_IMAGE_MODEL,


    // Google Gemini API Key
    GOOGLE_API_KEY: ENV.GOOGLE_API_KEY,
    // Google Gemini API
    GOOGLE_COMPLETIONS_API: ENV.GOOGLE_COMPLETIONS_API,
    // Google Gemini Model
    GOOGLE_COMPLETIONS_MODEL: ENV.GOOGLE_COMPLETIONS_MODEL,


    // mistral api key
    MISTRAL_API_KEY: ENV.MISTRAL_API_KEY,
    // mistral api base
    MISTRAL_COMPLETIONS_API: ENV.MISTRAL_COMPLETIONS_API,
    // mistral api model
    MISTRAL_CHAT_MODEL: ENV.MISTRAL_CHAT_MODEL,
  };

  /**
   * @typedef {object} CurrentChatContext
   * @property {string | number | null} chat_id
   * @property {string | number | null} reply_to_message_id - 如果是群组，这个值为消息ID，否则为null
   * @property {string | null} parse_mode
   * @property {string | number | null} message_id - 编辑消息的ID
   * @property {object | null} reply_markup -  回复键盘
   * @property {boolean | null} allow_sending_without_reply
   * @property {boolean | null} disable_web_page_preview
   */
  /**
   * 当前聊天上下文
   * @type {CurrentChatContext}
   * */
  CURRENT_CHAT_CONTEXT = {
    chat_id: null,
    reply_to_message_id: null,
    parse_mode: 'MarkdownV2',
    message_id: null,
    reply_markup: null,
    allow_sending_without_reply: null,
    disable_web_page_preview: null,
  };

  /**
   * @typedef {object} ShareContext
   * @property {string | null} currentBotId - 当前机器人 ID
   * @property {string | null} currentBotToken - 当前机器人 Token
   * @property {string | null} currentBotName - 当前机器人名称: xxx_bot
   * @property {string | null} chatHistoryKey - history:chat_id:bot_id:$from_id
   * @property {string | null} chatLastMessageIDKey - last_message_id:$chatHistoryKey
   * @property {string | null} configStoreKey - user_config:chat_id:bot_id:$from_id
   * @property {string | null} groupAdminKey - group_admin:group_id
   * @property {string | null} usageKey - usage:bot_id
   * @property {string | null} chatType - 会话场景, private/group/supergroup 等, 来源 message.chat.type
   * @property {string | number | null} chatId - 会话 id, private 场景为发言人 id, group/supergroup 场景为群组 id
   * @property {string | number | null} speakerId - 发言人 id
   * @property {object | null} extraMessageContext - 额外消息上下文
  * */
  /**
   * 共享上下文
   * @type {ShareContext}
   */
  SHARE_CONTEXT = {
    currentBotId: null,
    currentBotToken: null,
    currentBotName: null,
    chatHistoryKey: null,
    chatLastMessageIDKey: null,
    configStoreKey: null,
    groupAdminKey: null,
    usageKey: null,
    chatType: null,
    chatId: null,
    speakerId: null,
    extraMessageContext: null,
  };

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
   * @param {string} storeKey
   */
  async _initUserConfig(storeKey) {
    try {
      const userConfig = JSON.parse(await DATABASE.get(storeKey));
      const keys = userConfig?.DEFINE_KEYS || [];
      this.USER_CONFIG.DEFINE_KEYS = keys;
      mergeObject(this.USER_CONFIG, userConfig, keys);
    } catch (e) {
      console.error(e);
    }
    {
      const aiProvider = new Set('auto,openai,azure,workers,gemini,mistral'.split(','));
      if (!aiProvider.has(this.USER_CONFIG.AI_PROVIDER)) {
        this.USER_CONFIG.AI_PROVIDER = 'auto';
      }
    }
    {
      const aiImageProvider = new Set('auto,openai,azure,workers'.split(','));
      if (!aiImageProvider.has(this.USER_CONFIG.AI_IMAGE_PROVIDER)) {
        this.USER_CONFIG.AI_IMAGE_PROVIDER = 'auto';
      }
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

    this.SHARE_CONTEXT.chatHistoryKey = historyKey;
    this.SHARE_CONTEXT.chatLastMessageIDKey = `last_message_id:${historyKey}`;
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
