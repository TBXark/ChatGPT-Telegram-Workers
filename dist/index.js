// src/config/env.js
var UserConfig = class {
  // -- 非配置属性 --
  DEFINE_KEYS = [];
  // -- 通用配置 --
  //
  // AI提供商: auto, openai, azure, workers, gemini, mistral
  AI_PROVIDER = "auto";
  // AI图片提供商: auto, openai, azure, workers
  AI_IMAGE_PROVIDER = "auto";
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE = null;
  // -- Open AI 配置 --
  //
  // OpenAI API Key
  OPENAI_API_KEY = [];
  // OpenAI的模型名称
  OPENAI_CHAT_MODEL = "gpt-3.5-turbo";
  // OpenAI API BASE ``
  OPENAI_API_BASE = "https://api.openai.com/v1";
  // OpenAI API Extra Params
  OPENAI_API_EXTRA_PARAMS = {};
  // -- DALLE 配置 --
  //
  // DALL-E的模型名称
  DALL_E_MODEL = "dall-e-2";
  // DALL-E图片尺寸
  DALL_E_IMAGE_SIZE = "512x512";
  // DALL-E图片质量
  DALL_E_IMAGE_QUALITY = "standard";
  // DALL-E图片风格
  DALL_E_IMAGE_STYLE = "vivid";
  // -- AZURE 配置 --
  //
  // Azure API Key
  AZURE_API_KEY = null;
  // Azure Completions API
  AZURE_COMPLETIONS_API = null;
  // Azure DallE API
  AZURE_DALLE_API = null;
  // -- Workers 配置 --
  //
  // Cloudflare Account ID
  CLOUDFLARE_ACCOUNT_ID = null;
  // Cloudflare Token
  CLOUDFLARE_TOKEN = null;
  // Text Generation Model
  WORKERS_CHAT_MODEL = "@cf/mistral/mistral-7b-instruct-v0.1 ";
  // Text-to-Image Model
  WORKERS_IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
  // -- Gemini 配置 --
  //
  // Google Gemini API Key
  GOOGLE_API_KEY = null;
  // Google Gemini API
  GOOGLE_COMPLETIONS_API = "https://generativelanguage.googleapis.com/v1beta/models/";
  // Google Gemini Model
  GOOGLE_COMPLETIONS_MODEL = "gemini-pro";
  // -- Mistral 配置 --
  //
  // mistral api key
  MISTRAL_API_KEY = null;
  // mistral api base
  MISTRAL_API_BASE = "https://api.mistral.ai/v1";
  // mistral api model
  MISTRAL_CHAT_MODEL = "mistral-tiny";
  // -- Cohere 配置 --
  //
  // cohere api key
  COHERE_API_KEY = null;
  // cohere api base
  COHERE_API_BASE = "https://api.cohere.com/v1";
  // cohere api model
  COHERE_CHAT_MODEL = "command-r-plus";
  // -- Anthropic 配置 --
  //
  // Anthropic api key
  ANTHROPIC_API_KEY = null;
  // Anthropic api base
  ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";
  // Anthropic api model
  ANTHROPIC_CHAT_MODEL = "claude-3-haiku-20240307";
};
var Environment = class {
  // -- 版本数据 --
  //
  // 当前版本
  BUILD_TIMESTAMP = 1721185519;
  // 当前版本 commit id
  BUILD_VERSION = "c299549";
  // -- 基础配置 --
  /**
   * @type {I18n | null}
   */
  I18N = null;
  // 多语言支持
  LANGUAGE = "zh-cn";
  // 检查更新的分支
  UPDATE_BRANCH = "master";
  // -- Telegram 相关 --
  //
  // Telegram API Domain
  TELEGRAM_API_DOMAIN = "https://api.telegram.org";
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS = [];
  // 默认消息模式
  DEFAULT_PARSE_MODE = "Markdown";
  // --  权限相关 --
  //
  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON = false;
  // 白名单
  CHAT_WHITE_LIST = [];
  // 用户配置
  LOCK_USER_CONFIG_KEYS = [
    // 默认为API BASE 防止被替换导致token 泄露
    "OPENAI_API_BASE",
    "GOOGLE_COMPLETIONS_API",
    "MISTRAL_API_BASE",
    "COHERE_API_BASE",
    "ANTHROPIC_API_BASE",
    "AZURE_COMPLETIONS_API",
    "AZURE_DALLE_API"
  ];
  // -- 群组相关 --
  //
  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME = [];
  // 群组白名单
  CHAT_GROUP_WHITE_LIST = [];
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE = true;
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE = false;
  // -- 历史记录相关 --
  //
  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY = true;
  // 最大历史记录长度
  MAX_HISTORY_LENGTH = 20;
  // 最大消息长度
  MAX_TOKEN_LENGTH = 2048;
  // -- Prompt 相关 --
  //
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE = "system";
  // Chat Complete API Timeout
  CHAT_COMPLETE_API_TIMEOUT = 0;
  // -- 特性开关 --
  //
  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS = false;
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS = [];
  // 显示快捷回复按钮
  SHOW_REPLY_BUTTON = false;
  // 而外引用消息开关
  EXTRA_MESSAGE_CONTEXT = false;
  // -- 模式开关 --
  //
  // 使用流模式
  STREAM_MODE = true;
  // 安全模式
  SAFE_MODE = true;
  // 调试模式
  DEBUG_MODE = false;
  // 开发模式
  DEV_MODE = false;
  USER_CONFIG = new UserConfig();
};
var ENV = new Environment();
var DATABASE = null;
var API_GUARD = null;
var CUSTOM_COMMAND = {};
var CONST = {
  PASSWORD_KEY: "chat_history_password",
  GROUP_TYPES: ["group", "supergroup"],
  USER_AGENT: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"
};
var ENV_TYPES = {
  SYSTEM_INIT_MESSAGE: "string",
  OPENAI_API_BASE: "string",
  AZURE_API_KEY: "string",
  AZURE_COMPLETIONS_API: "string",
  AZURE_DALLE_API: "string",
  CLOUDFLARE_ACCOUNT_ID: "string",
  CLOUDFLARE_TOKEN: "string",
  GOOGLE_API_KEY: "string",
  MISTRAL_API_KEY: "string",
  COHERE_API_KEY: "string",
  ANTHROPIC_API_KEY: "string"
};
function mergeEnvironment(target, source) {
  for (const key of Object.keys(target)) {
    const t = ENV_TYPES[key] || typeof target[key];
    if (source[key]) {
      if (typeof source[key] !== "string") {
        target[key] = source[key];
        continue;
      }
      switch (t) {
        case "number":
          target[key] = parseInt(source[key], 10);
          break;
        case "boolean":
          target[key] = (source[key] || "false") === "true";
          break;
        case "string":
          target[key] = source[key];
          break;
        case "array":
          if (source[key].startsWith("[") && source[key].endsWith("]")) {
            try {
              target[key] = JSON.parse(source[key]);
              break;
            } catch (e) {
              console.error(e);
            }
          }
          target[key] = source[key].split(",");
          break;
        case "object":
          if (Array.isArray(target[key])) {
            target[key] = source[key].split(",");
          } else {
            try {
              target[key] = JSON.parse(source[key]);
            } catch (e) {
              console.error(e);
            }
          }
          break;
        default:
          target[key] = source[key];
          break;
      }
    }
  }
}
function initEnv(env, i18n2) {
  DATABASE = env.DATABASE;
  API_GUARD = env.API_GUARD;
  const customCommandPrefix = "CUSTOM_COMMAND_";
  for (const key of Object.keys(env)) {
    if (key.startsWith(customCommandPrefix)) {
      const cmd = key.substring(customCommandPrefix.length);
      CUSTOM_COMMAND["/" + cmd] = env[key];
    }
  }
  mergeEnvironment(ENV, env);
  mergeEnvironment(ENV.USER_CONFIG, env);
  ENV.USER_CONFIG.DEFINE_KEYS = [];
  {
    ENV.I18N = i18n2((ENV.LANGUAGE || "cn").toLowerCase());
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
    if (env.WORKERS_AI_MODEL) {
      ENV.USER_CONFIG.WORKERS_CHAT_MODEL = env.WORKERS_AI_MODEL;
    }
    if (env.OPENAI_API_DOMAIN && !ENV.OPENAI_API_BASE) {
      ENV.USER_CONFIG.OPENAI_API_BASE = `${env.OPENAI_API_DOMAIN}/v1`;
    }
    if (env.API_KEY && ENV.USER_CONFIG.OPENAI_API_KEY.length === 0) {
      ENV.USER_CONFIG.OPENAI_API_KEY = env.API_KEY.split(",");
    }
    if (env.CHAT_MODEL && !ENV.USER_CONFIG.OPENAI_CHAT_MODEL) {
      ENV.USER_CONFIG.OPENAI_CHAT_MODEL = env.CHAT_MODEL;
    }
    if (!ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
      ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE = ENV.I18N?.env?.system_init_message || "You are a helpful assistant";
    }
  }
}

// src/config/context.js
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
var Context = class {
  // 用户配置
  USER_CONFIG = new UserConfig();
  /**
   * 用于保存发起telegram请求的聊天上下文
   *
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
    parse_mode: ENV.DEFAULT_PARSE_MODE,
    message_id: null,
    reply_markup: null,
    allow_sending_without_reply: null,
    disable_web_page_preview: null
  };
  /**
   * 用于保存全局使用的临时变量
   *
   * @typedef {object} ShareContext
   * @property {string | null} currentBotId - 当前机器人 ID
   * @property {string | null} currentBotToken - 当前机器人 Token
   * @property {string | null} currentBotName - 当前机器人名称: xxx_bot
   * @property {string | null} chatHistoryKey - history:chat_id:bot_id:$from_id
   * @property {string | null} chatLastMessageIdKey - last_message_id:$chatHistoryKey
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
    chatLastMessageIdKey: null,
    configStoreKey: null,
    groupAdminKey: null,
    usageKey: null,
    chatType: null,
    chatId: null,
    speakerId: null,
    extraMessageContext: null
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
      this.USER_CONFIG = {
        ...ENV.USER_CONFIG
      };
      const userConfig = JSON.parse(await DATABASE.get(storeKey));
      const keys = userConfig?.DEFINE_KEYS || [];
      this.USER_CONFIG.DEFINE_KEYS = keys;
      mergeObject(this.USER_CONFIG, userConfig, keys);
    } catch (e) {
      console.error(e);
    }
  }
  /**
   * @param {Request} request
   */
  initTelegramContext(request) {
    const { pathname } = new URL(request.url);
    const token = pathname.match(
      /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/
    )[1];
    const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
    if (telegramIndex === -1) {
      throw new Error("Token not allowed");
    }
    this.SHARE_CONTEXT.currentBotToken = token;
    this.SHARE_CONTEXT.currentBotId = token.split(":")[0];
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
    if (id === void 0 || id === null) {
      throw new Error("Chat id not found");
    }
    const botId = this.SHARE_CONTEXT.currentBotId;
    let historyKey = `history:${id}`;
    let configStoreKey = `user_config:${id}`;
    let groupAdminKey = null;
    if (botId) {
      historyKey += `:${botId}`;
      configStoreKey += `:${botId}`;
    }
    if (CONST.GROUP_TYPES.includes(message.chat?.type)) {
      if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from.id) {
        historyKey += `:${message.from.id}`;
        configStoreKey += `:${message.from.id}`;
      }
      groupAdminKey = `group_admin:${id}`;
    }
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
    const chatId = message?.chat?.id;
    const replyId = CONST.GROUP_TYPES.includes(message.chat?.type) ? message.message_id : null;
    this._initChatContext(chatId, replyId);
    await this._initShareContext(message);
    await this._initUserConfig(this.SHARE_CONTEXT.configStoreKey);
  }
};

// src/utils/md2tgmd.js
var escapeChars = /([\_\*\[\]\(\)\\\~\`\>\#\+\-\=\|\{\}\.\!])/g;
function escape(text) {
  const lines = text.split("\n");
  const stack = [];
  const result = [];
  let linetrim = "";
  for (const [i, line] of lines.entries()) {
    linetrim = line.trim();
    let startIndex;
    if (/^```.+/.test(linetrim)) {
      stack.push(i);
    } else if (linetrim === "```") {
      if (stack.length) {
        startIndex = stack.pop();
        if (!stack.length) {
          const content = lines.slice(startIndex, i + 1).join("\n");
          result.push(handleEscape(content, "code"));
          continue;
        }
      } else {
        stack.push(i);
      }
    }
    if (!stack.length) {
      result.push(handleEscape(line));
    }
  }
  if (stack.length) {
    const last = lines.slice(stack[0]).join("\n") + "\n```";
    result.push(handleEscape(last, "code"));
  }
  return result.join("\n");
}
function handleEscape(text, type = "text") {
  if (!text.trim()) {
    return text;
  }
  if (type === "text") {
    text = text.replace(escapeChars, "\\$1").replace(/\\\*\\\*(.*?[^\\])\\\*\\\*/g, "*$1*").replace(/\\_\\_(.*?[^\\])\\_\\_/g, "__$1__").replace(/\\_(.*?[^\\])\\_/g, "_$1_").replace(/\\~(.*?[^\\])\\~/g, "~$1~").replace(/\\\|\\\|(.*?[^\\])\\\|\\\|/g, "||$1||").replace(/\\\[([^\]]+?)\\\]\\\((.+?)\\\)/g, "[$1]($2)").replace(/\\\`(.*?[^\\])\\\`/g, "`$1`").replace(/\\\\\\([\_\*\[\]\(\)\\\~\`\>\#\+\-\=\|\{\}\.\!])/g, "\\$1").replace(/^(\s*)\\(>.+\s*)$/gm, "$1$2").replace(/^(\s*)\\-\s*(.+)$/gm, "$1\u2022 $2").replace(/^((\\#){1,3}\s)(.+)/gm, "$1*$3*");
  } else {
    const codeBlank = text.length - text.trimStart().length;
    if (codeBlank > 0) {
      const blankReg = new RegExp(`^\\s{${codeBlank}}`, "gm");
      text = text.replace(blankReg, "");
    }
    text = text.trimEnd().replace(/([\\\`])/g, "\\$1").replace(/^\\`\\`\\`([\s\S]+)\\`\\`\\`$/g, "```$1```");
  }
  return text;
}

// src/telegram/telegram.js
async function sendMessage(message, token, context) {
  const body = {
    text: message
  };
  for (const key of Object.keys(context)) {
    if (context[key] !== void 0 && context[key] !== null) {
      body[key] = context[key];
    }
  }
  let method = "sendMessage";
  if (context?.message_id) {
    method = "editMessageText";
  }
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}
async function sendMessageToTelegram(message, token, context) {
  const chatContext = context;
  const originMessage = message;
  const limit = 4096;
  if (chatContext.parse_mode === "MarkdownV2") {
    message = escape(message);
  }
  if (message.length <= limit) {
    const resp = await sendMessage(message, token, chatContext);
    if (resp.status === 200) {
      return resp;
    } else {
      message = originMessage;
      chatContext.parse_mode = null;
      return await sendMessage(message, token, chatContext);
    }
  }
  message = originMessage;
  chatContext.parse_mode = null;
  let lastMessageResponse = null;
  for (let i = 0; i < message.length; i += limit) {
    const msg = message.slice(i, Math.min(i + limit, message.length));
    if (i > 0) {
      chatContext.message_id = null;
    }
    lastMessageResponse = await sendMessage(msg, token, chatContext);
  }
  return lastMessageResponse;
}
function sendMessageToTelegramWithContext(context) {
  return async (message) => {
    return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
  };
}
function deleteMessageFromTelegramWithContext(context) {
  return async (messageId) => {
    return await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${context.SHARE_CONTEXT.currentBotToken}/deleteMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: context.CURRENT_CHAT_CONTEXT.chat_id,
          message_id: messageId
        })
      }
    );
  };
}
async function sendPhotoToTelegram(photo, token, context) {
  const url = `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendPhoto`;
  let body;
  const headers = {};
  if (typeof photo === "string") {
    body = {
      photo
    };
    for (const key of Object.keys(context)) {
      if (context[key] !== void 0 && context[key] !== null) {
        body[key] = context[key];
      }
    }
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  } else {
    body = new FormData();
    body.append("photo", photo, "photo.png");
    for (const key of Object.keys(context)) {
      if (context[key] !== void 0 && context[key] !== null) {
        body.append(key, `${context[key]}`);
      }
    }
  }
  return await fetch(
    url,
    {
      method: "POST",
      headers,
      body
    }
  );
}
function sendPhotoToTelegramWithContext(context) {
  return (url) => {
    return sendPhotoToTelegram(url, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
  };
}
async function sendChatActionToTelegram(action, token, chatId) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendChatAction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        action
      })
    }
  ).then((res) => res.json());
}
function sendChatActionToTelegramWithContext(context) {
  return (action) => {
    return sendChatActionToTelegram(action, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT.chat_id);
  };
}
async function bindTelegramWebHook(token, url) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url
      })
    }
  ).then((res) => res.json());
}
async function getChatRole(id, groupAdminKey, chatId, token) {
  let groupAdmin;
  try {
    groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
  } catch (e) {
    console.error(e);
    return e.message;
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(chatId, token);
    if (administers == null) {
      return null;
    }
    groupAdmin = administers;
    await DATABASE.put(
      groupAdminKey,
      JSON.stringify(groupAdmin),
      { expiration: Date.now() / 1e3 + 120 }
    );
  }
  for (let i = 0; i < groupAdmin.length; i++) {
    const user = groupAdmin[i];
    if (user.user.id === id) {
      return user.status;
    }
  }
  return "member";
}
function getChatRoleWithContext(context) {
  return (id) => {
    return getChatRole(id, context.SHARE_CONTEXT.groupAdminKey, context.CURRENT_CHAT_CONTEXT.chat_id, context.SHARE_CONTEXT.currentBotToken);
  };
}
async function getChatAdminister(chatId, token) {
  try {
    const resp = await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getChatAdministrators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chat_id: chatId })
      }
    ).then((res) => res.json());
    if (resp.ok) {
      return resp.result;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}
async function getBot(token) {
  const resp = await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getMe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }
  ).then((res) => res.json());
  if (resp.ok) {
    return {
      ok: true,
      info: {
        name: resp.result.first_name,
        bot_name: resp.result.username,
        can_join_groups: resp.result.can_join_groups,
        can_read_all_group_messages: resp.result.can_read_all_group_messages
      }
    };
  } else {
    return resp;
  }
}

// src/agent/stream.js
var Stream = class {
  constructor(response, controller, decoder = null, parser = null) {
    this.response = response;
    this.controller = controller;
    this.decoder = decoder || new SSEDecoder();
    this.parser = parser || openaiSseJsonParser;
  }
  async *iterMessages() {
    if (!this.response.body) {
      this.controller.abort();
      throw new Error(`Attempted to iterate over a response with no body`);
    }
    const lineDecoder = new LineDecoder();
    const iter = this.response.body;
    for await (const chunk of iter) {
      for (const line of lineDecoder.decode(chunk)) {
        const sse = this.decoder.decode(line);
        if (sse)
          yield sse;
      }
    }
    for (const line of lineDecoder.flush()) {
      const sse = this.decoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  async *[Symbol.asyncIterator]() {
    let done = false;
    try {
      for await (const sse of this.iterMessages()) {
        if (done) {
          continue;
        }
        if (!sse) {
          continue;
        }
        const { finish, data } = this.parser(sse);
        if (finish) {
          done = finish;
          continue;
        }
        if (data) {
          yield data;
        }
      }
      done = true;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError")
        return;
      throw e;
    } finally {
      if (!done)
        this.controller.abort();
    }
  }
};
var SSEDecoder = class {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length) {
        return null;
      }
      const sse = {
        event: this.event,
        data: this.data.join("\n")
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldName, _, value] = this.partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldName === "event") {
      this.event = value;
    } else if (fieldName === "data") {
      this.data.push(value);
    }
    return null;
  }
  partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
      return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, "", ""];
  }
};
var JSONLDecoder = class {
  constructor() {
  }
  decode(line) {
    return line;
  }
};
function openaiSseJsonParser(sse) {
  if (sse.data.startsWith("[DONE]")) {
    return { finish: true };
  }
  if (sse.event === null) {
    try {
      return { data: JSON.parse(sse.data) };
    } catch (e) {
      console.error(e, sse);
    }
  }
  return {};
}
function cohereSseJsonParser(sse) {
  try {
    const res = JSON.parse(sse);
    return {
      finish: res.is_finished,
      data: res
    };
  } catch (e) {
    console.error(e, sse);
    const finish = sse.startsWith('{"is_finished":true');
    return { finish };
  }
}
function anthropicSseJsonParser(sse) {
  switch (sse.event) {
    case "content_block_delta":
      try {
        return { data: JSON.parse(sse.data) };
      } catch (e) {
        console.error(e, sse.data);
        return {};
      }
    case "message_start":
    case "content_block_start":
    case "content_block_stop":
      return {};
    case "message_stop":
      return { finish: true };
    default:
      return {};
  }
}
var LineDecoder = class {
  constructor() {
    this.buffer = [];
    this.trailingCR = false;
  }
  decode(chunk) {
    let text = this.decodeText(chunk);
    if (this.trailingCR) {
      text = "\r" + text;
      this.trailingCR = false;
    }
    if (text.endsWith("\r")) {
      this.trailingCR = true;
      text = text.slice(0, -1);
    }
    if (!text) {
      return [];
    }
    const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || "");
    let lines = text.split(LineDecoder.NEWLINE_REGEXP);
    if (lines.length === 1 && !trailingNewline) {
      this.buffer.push(lines[0]);
      return [];
    }
    if (this.buffer.length > 0) {
      lines = [this.buffer.join("") + lines[0], ...lines.slice(1)];
      this.buffer = [];
    }
    if (!trailingNewline) {
      this.buffer = [lines.pop() || ""];
    }
    return lines;
  }
  decodeText(bytes) {
    var _a;
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new Error(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        (_a = this.textDecoder) !== null && _a !== void 0 ? _a : this.textDecoder = new TextDecoder("utf8");
        return this.textDecoder.decode(bytes, { stream: true });
      }
      throw new Error(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new Error(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length && !this.trailingCR) {
      return [];
    }
    const lines = [this.buffer.join("")];
    this.buffer = [];
    this.trailingCR = false;
    return lines;
  }
};
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;

// src/agent/request.js
function fixOpenAICompatibleOptions(options) {
  options = options || {};
  options.streamBuilder = options.streamBuilder || function(r, c) {
    return new Stream(r, c);
  };
  options.contentExtractor = options.contentExtractor || function(d) {
    return d?.choices?.[0]?.delta?.content;
  };
  options.fullContentExtractor = options.fullContentExtractor || function(d) {
    return d.choices?.[0]?.message.content;
  };
  options.errorExtractor = options.errorExtractor || function(d) {
    return d.error?.message;
  };
  return options;
}
function isJsonResponse(resp) {
  return resp.headers.get("content-type").indexOf("json") !== -1;
}
function isEventStreamResponse(resp) {
  const types = ["application/stream+json", "text/event-stream"];
  const content = resp.headers.get("content-type");
  for (const type of types) {
    if (content.indexOf(type) !== -1) {
      return true;
    }
  }
  return false;
}
async function requestChatCompletions(url, header, body, context, onStream, onResult = null, options = null) {
  const controller = new AbortController();
  const { signal } = controller;
  let timeoutID = null;
  if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
    timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT);
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
    signal
  });
  if (timeoutID) {
    clearTimeout(timeoutID);
  }
  options = fixOpenAICompatibleOptions(options);
  if (onStream && resp.ok && isEventStreamResponse(resp)) {
    const stream = options.streamBuilder(resp, controller);
    let contentFull = "";
    let lengthDelta = 0;
    let updateStep = 50;
    try {
      for await (const data of stream) {
        const c = options.contentExtractor(data) || "";
        if (c === "") {
          continue;
        }
        lengthDelta += c.length;
        contentFull = contentFull + c;
        if (lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 20;
          await onStream(`${contentFull}
${ENV.I18N.message.loading}...`);
        }
      }
    } catch (e) {
      contentFull += `
ERROR: ${e.message}`;
    }
    return contentFull;
  }
  if (!isJsonResponse(resp)) {
    throw new Error(resp.statusText);
  }
  const result = await resp.json();
  if (!result) {
    throw new Error("Empty response");
  }
  if (options.errorExtractor(result)) {
    throw new Error(options.errorExtractor(result));
  }
  try {
    onResult?.(result);
    return options.fullContentExtractor(result);
  } catch (e) {
    throw Error(JSON.stringify(result));
  }
}

// src/agent/openai.js
function openAIKeyFromContext(context) {
  const length = context.USER_CONFIG.OPENAI_API_KEY.length;
  return context.USER_CONFIG.OPENAI_API_KEY[Math.floor(Math.random() * length)];
}
function isOpenAIEnable(context) {
  return context.USER_CONFIG.OPENAI_API_KEY.length > 0;
}
async function requestCompletionsFromOpenAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.OPENAI_API_BASE}/chat/completions`;
  const body = {
    model: context.USER_CONFIG.OPENAI_CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...history || [], { role: "user", content: message }],
    stream: onStream != null
  };
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${openAIKeyFromContext(context)}`
  };
  return requestChatCompletions(url, header, body, context, onStream);
}
async function requestImageFromOpenAI(prompt, context) {
  const url = `${context.USER_CONFIG.OPENAI_API_BASE}/images/generations`;
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${openAIKeyFromContext(context)}`
  };
  const body = {
    prompt,
    n: 1,
    size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
    model: context.USER_CONFIG.DALL_E_MODEL
  };
  if (body.model === "dall-e-3") {
    body.quality = context.USER_CONFIG.DALL_E_IMAGE_QUALITY;
    body.style = context.USER_CONFIG.DALL_E_IMAGE_STYLE;
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(resp.error.message);
  }
  return resp?.data?.[0]?.url;
}

// src/agent/workersai.js
async function run(model, body, id, token) {
  return await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: JSON.stringify(body)
    }
  );
}
function isWorkersAIEnable(context) {
  return !!(context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID && context.USER_CONFIG.CLOUDFLARE_TOKEN);
}
async function requestCompletionsFromWorkersAI(message, history, context, onStream) {
  const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
  const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
  const model = context.USER_CONFIG.WORKERS_CHAT_MODEL;
  const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
  const header = {
    Authorization: `Bearer ${token}`
  };
  const body = {
    messages: [...history || [], { role: "user", content: message }],
    stream: onStream !== null
  };
  const options = {};
  options.contentExtractor = function(data) {
    return data?.response;
  };
  options.fullContentExtractor = function(data) {
    return data?.result?.response;
  };
  options.errorExtractor = function(data) {
    return data?.errors?.[0]?.message;
  };
  return requestChatCompletions(url, header, body, context, onStream, null, options);
}
async function requestImageFromWorkersAI(prompt, context) {
  const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
  const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
  const raw = await run(context.USER_CONFIG.WORKERS_IMAGE_MODEL, { prompt }, id, token);
  return await raw.blob();
}

// src/agent/gemini.js
function isGeminiAIEnable(context) {
  return !!context.USER_CONFIG.GOOGLE_API_KEY;
}
async function requestCompletionsFromGeminiAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.GOOGLE_COMPLETIONS_API}${context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL}:${// 暂时不支持stream模式
  // onStream ? 'streamGenerateContent' : 'generateContent'
  "generateContent"}?key=${context.USER_CONFIG.GOOGLE_API_KEY}`;
  const contentsTemp = [...history || [], { role: "user", content: message }];
  const contents = [];
  for (const msg of contentsTemp) {
    switch (msg.role) {
      case "assistant":
        msg.role = "model";
        break;
      case "system":
      case "user":
        msg.role = "user";
        break;
      default:
        continue;
    }
    if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
      contents.push({
        "role": msg.role,
        "parts": [
          {
            "text": msg.content
          }
        ]
      });
    } else {
      contents[contents.length - 1].parts[0].text += msg.content;
    }
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": CONST.USER_AGENT
    },
    body: JSON.stringify({ contents })
  });
  const data = await resp.json();
  try {
    return data.candidates[0].content.parts[0].text;
  } catch (e) {
    if (!data) {
      throw new Error("Empty response");
    }
    throw new Error(data?.error?.message || JSON.stringify(data));
  }
}

// src/agent/mistralai.js
function isMistralAIEnable(context) {
  return !!context.USER_CONFIG.MISTRAL_API_KEY;
}
async function requestCompletionsFromMistralAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.MISTRAL_API_BASE}/chat/completions`;
  const body = {
    model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
    messages: [...history || [], { role: "user", content: message }],
    stream: onStream != null
  };
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`
  };
  return requestChatCompletions(url, header, body, context, onStream);
}

// src/agent/cohere.js
function isCohereAIEnable(context) {
  return !!context.USER_CONFIG.COHERE_API_KEY;
}
async function requestCompletionsFromCohereAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
  const header = {
    "Authorization": `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  const contentsTemp = [];
  let preamble = "";
  for (const msg of history) {
    switch (msg.role) {
      case "system":
        preamble = msg.content;
        break;
      case "assistant":
        if (msg.content) {
          contentsTemp.push({ role: "CHATBOT", message: msg.content });
        }
        break;
      case "user":
        if (msg.content) {
          contentsTemp.push({ role: "USER", message: msg.content });
        }
        break;
      default:
        break;
    }
  }
  const body = {
    message,
    model: context.USER_CONFIG.COHERE_CHAT_MODEL,
    stream: onStream != null,
    preamble,
    chat_history: contentsTemp
  };
  const options = {};
  options.streamBuilder = function(r, c) {
    return new Stream(r, c, new JSONLDecoder(), cohereSseJsonParser);
  };
  options.contentExtractor = function(data) {
    if (data?.event_type === "text-generation") {
      return data?.text;
    }
    return null;
  };
  options.fullContentExtractor = function(data) {
    return data?.text;
  };
  options.errorExtractor = function(data) {
    return data?.message;
  };
  return requestChatCompletions(url, header, body, context, onStream, null, options);
}

// src/agent/anthropic.js
function isAnthropicAIEnable(context) {
  return !!context.USER_CONFIG.ANTHROPIC_API_KEY;
}
async function requestCompletionsFromAnthropicAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
  const header = {
    "x-api-key": context.USER_CONFIG.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  };
  let system = null;
  for (const msg in history) {
    if (msg.role === "system") {
      system = msg.content;
      break;
    }
  }
  history = history.filter((msg) => msg.role !== "system");
  const body = {
    system,
    model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
    messages: [...history || [], { role: "user", content: message }],
    stream: onStream != null,
    max_tokens: ENV.MAX_TOKEN_LENGTH
  };
  if (!body.system) {
    delete body.system;
  }
  const options = {};
  options.streamBuilder = function(r, c) {
    return new Stream(r, c, null, anthropicSseJsonParser);
  };
  options.contentExtractor = function(data) {
    return data?.delta?.text;
  };
  options.fullContentExtractor = function(data) {
    return data?.content?.[0].text;
  };
  options.errorExtractor = function(data) {
    return data?.error?.message;
  };
  return requestChatCompletions(url, header, body, context, onStream, null, options);
}

// src/agent/azure.js
function azureKeyFromContext(context) {
  return context.USER_CONFIG.AZURE_API_KEY;
}
function isAzureEnable(context) {
  return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_COMPLETIONS_API);
}
function isAzureImageEnable(context) {
  return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_DALLE_API);
}
async function requestCompletionsFromAzureOpenAI(message, history, context, onStream) {
  const url = context.USER_CONFIG.AZURE_COMPLETIONS_API;
  const body = {
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...history || [], { role: "user", content: message }],
    stream: onStream != null
  };
  const header = {
    "Content-Type": "application/json",
    "api-key": azureKeyFromContext(context)
  };
  return requestChatCompletions(url, header, body, context, onStream);
}
async function requestImageFromAzureOpenAI(prompt, context) {
  const url = context.USER_CONFIG.AZURE_DALLE_API;
  const header = {
    "Content-Type": "application/json",
    "api-key": azureKeyFromContext(context)
  };
  const body = {
    prompt,
    n: 1,
    size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
    style: context.USER_CONFIG.DALL_E_IMAGE_STYLE,
    quality: context.USER_CONFIG.DALL_E_IMAGE_QUALITY
  };
  const validSize = ["1792x1024", "1024x1024", "1024x1792"];
  if (!validSize.includes(body.size)) {
    body.size = "1024x1024";
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(resp.error.message);
  }
  return resp?.data?.[0]?.url;
}

// src/agent/agents.js
var chatLlmAgents = [
  {
    name: "azure",
    enable: isAzureEnable,
    request: requestCompletionsFromAzureOpenAI
  },
  {
    name: "openai",
    enable: isOpenAIEnable,
    request: requestCompletionsFromOpenAI
  },
  {
    name: "workers",
    enable: isWorkersAIEnable,
    request: requestCompletionsFromWorkersAI
  },
  {
    name: "gemini",
    enable: isGeminiAIEnable,
    request: requestCompletionsFromGeminiAI
  },
  {
    name: "mistral",
    enable: isMistralAIEnable,
    request: requestCompletionsFromMistralAI
  },
  {
    name: "cohere",
    enable: isCohereAIEnable,
    request: requestCompletionsFromCohereAI
  },
  {
    name: "anthropic",
    enable: isAnthropicAIEnable,
    request: requestCompletionsFromAnthropicAI
  }
];
function currentChatModel(agent, context) {
  switch (agent) {
    case "azure":
      return "azure";
    case "openai":
      return context.USER_CONFIG.OPENAI_CHAT_MODEL;
    case "workers":
      return context.USER_CONFIG.WORKERS_CHAT_MODEL;
    case "gemini":
      return context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL;
    case "mistral":
      return context.USER_CONFIG.MISTRAL_CHAT_MODEL;
    case "cohere":
      return context.USER_CONFIG.COHERE_CHAT_MODEL;
    case "anthropic":
      return context.USER_CONFIG.ANTHROPIC_CHAT_MODEL;
    default:
      return null;
  }
}
function defaultChatAgent(context) {
  for (const llm of chatLlmAgents) {
    if (llm.enable(context)) {
      return llm.name;
    }
  }
  return null;
}
var imageGenAgents = [
  {
    name: "azure",
    enable: isAzureImageEnable,
    request: requestImageFromAzureOpenAI
  },
  {
    name: "openai",
    enable: isOpenAIEnable,
    request: requestImageFromOpenAI
  },
  {
    name: "workers",
    enable: isWorkersAIEnable,
    request: requestImageFromWorkersAI
  }
];

// src/agent/llm.js
function tokensCounter() {
  return (text) => {
    return text.length;
  };
}
async function loadHistory(key, context) {
  const initMessage = {
    role: "system",
    content: context.USER_CONFIG.SYSTEM_INIT_MESSAGE || "You are a useful assistant!"
  };
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  if (historyDisable) {
    initMessage.role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
    return { real: [initMessage], original: [initMessage] };
  }
  let history = [];
  try {
    history = JSON.parse(await DATABASE.get(key));
  } catch (e) {
    console.error(e);
  }
  if (!history || !Array.isArray(history)) {
    history = [];
  }
  let original = JSON.parse(JSON.stringify(history));
  const counter = tokensCounter();
  const trimHistory = (list, initLength, maxLength, maxToken) => {
    if (list.length > maxLength) {
      list = list.splice(list.length - maxLength);
    }
    let tokenLength = initLength;
    for (let i = list.length - 1; i >= 0; i--) {
      const historyItem = list[i];
      let length = 0;
      if (historyItem.content) {
        length = counter(historyItem.content);
      } else {
        historyItem.content = "";
      }
      tokenLength += length;
      if (tokenLength > maxToken) {
        list = list.splice(i + 1);
        break;
      }
    }
    return list;
  };
  if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
    const initLength = counter(initMessage.content);
    history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    original = trimHistory(original, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
  }
  switch (history.length > 0 ? history[0].role : "") {
    case "assistant":
    case "system":
      history[0] = initMessage;
      break;
    default:
      history.unshift(initMessage);
  }
  if (ENV.SYSTEM_INIT_MESSAGE_ROLE !== "system" && history.length > 0 && history[0].role === "system") {
    history[0].role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
  }
  return { real: history, original };
}
function loadChatLLM(context) {
  for (const llm of chatLlmAgents) {
    if (llm.name === context.USER_CONFIG.AI_PROVIDER) {
      return llm.request;
    }
  }
  for (const llm of chatLlmAgents) {
    if (llm.enable(context)) {
      return llm.request;
    }
  }
  return null;
}
function loadImageGen(context) {
  for (const imgGen of imageGenAgents) {
    if (imgGen.name === context.USER_CONFIG.AI_IMAGE_PROVIDER) {
      return imgGen.request;
    }
  }
  for (const imgGen of imageGenAgents) {
    if (imgGen.enable(context)) {
      return imgGen.request;
    }
  }
  return null;
}
async function requestCompletionsFromLLM(text, context, llm, modifier, onStream) {
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
  let history = await loadHistory(historyKey, context);
  if (modifier) {
    const modifierData = modifier(history, text);
    history = modifierData.history;
    text = modifierData.text;
  }
  const { real: realHistory, original: originalHistory } = history;
  const answer = await llm(text, realHistory, context, onStream);
  if (!historyDisable) {
    originalHistory.push({ role: "user", content: text || "" });
    originalHistory.push({ role: "assistant", content: answer });
    await DATABASE.put(historyKey, JSON.stringify(originalHistory)).catch(console.error);
  }
  return answer;
}
async function chatWithLLM(text, context, modifier) {
  try {
    try {
      const msg = await sendMessageToTelegramWithContext(context)(ENV.I18N.message.loading).then((r) => r.json());
      context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id;
      context.CURRENT_CHAT_CONTEXT.reply_markup = null;
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => sendChatActionToTelegramWithContext(context)("typing").catch(console.error), 0);
    let onStream = null;
    const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
    let nextEnableTime = null;
    if (ENV.STREAM_MODE) {
      context.CURRENT_CHAT_CONTEXT.parse_mode = null;
      onStream = async (text2) => {
        try {
          if (nextEnableTime && nextEnableTime > Date.now()) {
            return;
          }
          const resp = await sendMessageToTelegramWithContext(context)(text2);
          if (resp.status === 429) {
            const retryAfter = parseInt(resp.headers.get("Retry-After"));
            if (retryAfter) {
              nextEnableTime = Date.now() + retryAfter * 1e3;
              return;
            }
          }
          nextEnableTime = null;
          if (resp.ok) {
            context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json()).result.message_id;
          }
        } catch (e) {
          console.error(e);
        }
      };
    }
    const llm = loadChatLLM(context);
    if (llm === null) {
      return sendMessageToTelegramWithContext(context)(`LLM is not enable`);
    }
    const answer = await requestCompletionsFromLLM(text, context, llm, modifier, onStream);
    context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
    if (ENV.SHOW_REPLY_BUTTON && context.CURRENT_CHAT_CONTEXT.message_id) {
      try {
        await deleteMessageFromTelegramWithContext(context)(context.CURRENT_CHAT_CONTEXT.message_id);
        context.CURRENT_CHAT_CONTEXT.message_id = null;
        context.CURRENT_CHAT_CONTEXT.reply_markup = {
          keyboard: [[{ text: "/new" }, { text: "/redo" }]],
          selective: true,
          resize_keyboard: true,
          one_time_keyboard: true
        };
      } catch (e) {
        console.error(e);
      }
    }
    if (nextEnableTime && nextEnableTime > Date.now()) {
      await new Promise((resolve) => setTimeout(resolve, nextEnableTime - Date.now()));
    }
    return sendMessageToTelegramWithContext(context)(answer);
  } catch (e) {
    let errMsg = `Error: ${e.message}`;
    if (errMsg.length > 2048) {
      errMsg = errMsg.substring(0, 2048);
    }
    context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
    return sendMessageToTelegramWithContext(context)(errMsg);
  }
}

// src/telegram/command.js
var commandAuthCheck = {
  default: function(chatType) {
    if (CONST.GROUP_TYPES.includes(chatType)) {
      return ["administrator", "creator"];
    }
    return false;
  },
  shareModeGroup: function(chatType) {
    if (CONST.GROUP_TYPES.includes(chatType)) {
      if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
        return false;
      }
      return ["administrator", "creator"];
    }
    return false;
  }
};
var commandSortList = [
  "/new",
  "/redo",
  "/img",
  "/setenv",
  "/delenv",
  "/version",
  "/usage",
  "/system",
  "/help"
];
var commandHandlers = {
  "/help": {
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandGetHelp
  },
  "/new": {
    scopes: ["all_private_chats", "all_group_chats", "all_chat_administrators"],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/start": {
    scopes: [],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.default
  },
  "/img": {
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandGenerateImg,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/version": {
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandFetchUpdate,
    needAuth: commandAuthCheck.default
  },
  "/setenv": {
    scopes: [],
    fn: commandUpdateUserConfig,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/setenvs": {
    scopes: [],
    fn: commandUpdateUserConfigs,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/delenv": {
    scopes: [],
    fn: commandDeleteUserConfig,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/clearenv": {
    scopes: [],
    fn: commandClearUserConfig,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/usage": {
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandUsage,
    needAuth: commandAuthCheck.default
  },
  "/system": {
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandSystem,
    needAuth: commandAuthCheck.default
  },
  "/redo": {
    scopes: ["all_private_chats", "all_group_chats", "all_chat_administrators"],
    fn: commandRegenerate,
    needAuth: commandAuthCheck.shareModeGroup
  }
};
async function commandGenerateImg(message, command, subcommand, context) {
  if (subcommand === "") {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.img.help);
  }
  try {
    setTimeout(() => sendChatActionToTelegramWithContext(context)("upload_photo").catch(console.error), 0);
    const gen = loadImageGen(context);
    if (!gen) {
      return sendMessageToTelegramWithContext(context)(`ERROR: Image generator not found`);
    }
    const img = await gen(subcommand, context);
    return sendPhotoToTelegramWithContext(context)(img);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
  }
}
async function commandGetHelp(message, command, subcommand, context) {
  const helpMsg = ENV.I18N.command.help.summary + Object.keys(commandHandlers).map((key) => `${key}\uFF1A${ENV.I18N.command.help[key.substring(1)]}`).join("\n");
  return sendMessageToTelegramWithContext(context)(helpMsg);
}
async function commandCreateNewChatContext(message, command, subcommand, context) {
  try {
    await DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
    context.CURRENT_CHAT_CONTEXT.reply_markup = JSON.stringify({
      remove_keyboard: true,
      selective: true
    });
    if (command === "/new") {
      return sendMessageToTelegramWithContext(context)(ENV.I18N.command.new.new_chat_start);
    } else {
      if (context.SHARE_CONTEXT.chatType === "private") {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.new.new_chat_start_private(context.CURRENT_CHAT_CONTEXT.chat_id));
      } else {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.new.new_chat_start_group(context.CURRENT_CHAT_CONTEXT.chat_id));
      }
    }
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
  }
}
async function commandUpdateUserConfig(message, command, subcommand, context) {
  const kv = subcommand.indexOf("=");
  if (kv === -1) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.help);
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
    const msg = ENV.I18N.command.setenv.update_config_error(new Error(`Key ${key} is locked`));
    return sendMessageToTelegramWithContext(context)(msg);
  }
  try {
    context.USER_CONFIG.DEFINE_KEYS.push(key);
    context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
    mergeEnvironment(context.USER_CONFIG, {
      [key]: value
    });
    console.log("Update user config: ", key, context.USER_CONFIG[key]);
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify(context.USER_CONFIG)
    );
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_success);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_error(e));
  }
}
async function commandUpdateUserConfigs(message, command, subcommand, context) {
  try {
    const values = JSON.parse(subcommand);
    for (const ent of Object.entries(values)) {
      const [key, value] = ent;
      if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
        const msg = ENV.I18N.command.setenv.update_config_error(new Error(`Key ${key} is locked`));
        return sendMessageToTelegramWithContext(context)(msg);
      }
      context.USER_CONFIG.DEFINE_KEYS.push(key);
      mergeEnvironment(context.USER_CONFIG, {
        [key]: value
      });
      console.log("Update user config: ", key, context.USER_CONFIG[key]);
    }
    context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify(context.USER_CONFIG)
    );
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_success);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_error(e));
  }
}
async function commandDeleteUserConfig(message, command, subcommand, context) {
  if (ENV.LOCK_USER_CONFIG_KEYS.includes(subcommand)) {
    const msg = ENV.I18N.command.setenv.update_config_error(new Error(`Key ${subcommand} is locked`));
    return sendMessageToTelegramWithContext(context)(msg);
  }
  try {
    context.USER_CONFIG[subcommand] = null;
    context.USER_CONFIG.DEFINE_KEYS = context.USER_CONFIG.DEFINE_KEYS.filter((key) => key !== subcommand);
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify(context.USER_CONFIG)
    );
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_success);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_error(e));
  }
}
async function commandClearUserConfig(message, command, subcommand, context) {
  try {
    context.USER_CONFIG.DEFINE_KEYS = [];
    context.USER_CONFIG = {};
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify({})
    );
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_success);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.setenv.update_config_error(e));
  }
}
async function commandFetchUpdate(message, command, subcommand, context) {
  const config = {
    headers: {
      "User-Agent": CONST.USER_AGENT
    }
  };
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION
  };
  const repo = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.UPDATE_BRANCH}`;
  const ts = `${repo}/dist/timestamp`;
  const info = `${repo}/dist/buildinfo.json`;
  let online = await fetch(info, config).then((r) => r.json()).catch(() => null);
  if (!online) {
    online = await fetch(ts, config).then((r) => r.text()).then((ts2) => ({ ts: Number(ts2.trim()), sha: "unknown" })).catch(() => ({ ts: 0, sha: "unknown" }));
  }
  if (current.ts < online.ts) {
    const msg = ENV.I18N.command.version.new_version_found(current, online);
    return sendMessageToTelegramWithContext(context)(msg);
  } else {
    const msg = ENV.I18N.command.version.current_is_latest_version(current);
    return sendMessageToTelegramWithContext(context)(msg);
  }
}
async function commandUsage(message, command, subcommand, context) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.usage.usage_not_open);
  }
  const usage = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));
  let text = ENV.I18N.command.usage.current_usage;
  if (usage?.tokens) {
    const { tokens } = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort((a, b) => tokens.chats[b] - tokens.chats[a]);
    text += ENV.I18N.command.usage.total_usage(tokens.total);
    for (let i = 0; i < Math.min(sortedChats.length, 30); i++) {
      text += `
  - ${sortedChats[i]}: ${tokens.chats[sortedChats[i]]} tokens`;
    }
    if (sortedChats.length === 0) {
      text += "0 tokens";
    } else if (sortedChats.length > 30) {
      text += "\n  ...";
    }
  } else {
    text += ENV.I18N.command.usage.no_usage;
  }
  return sendMessageToTelegramWithContext(context)(text);
}
async function commandSystem(message, command, subcommand, context) {
  let agent = context.USER_CONFIG.AI_PROVIDER;
  let model = currentChatModel(agent, context) || currentChatModel(defaultChatAgent(context), agent);
  let msg = `AI_PROVIDER: ${agent}
AI_MODEL: ${model}
`;
  if (ENV.DEV_MODE) {
    const shareCtx = { ...context.SHARE_CONTEXT };
    shareCtx.currentBotToken = "******";
    context.USER_CONFIG.OPENAI_API_KEY = "******";
    context.USER_CONFIG.AZURE_API_KEY = "******";
    context.USER_CONFIG.AZURE_COMPLETIONS_API = "******";
    context.USER_CONFIG.AZURE_DALLE_API = "******";
    context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID = "******";
    context.USER_CONFIG.CLOUDFLARE_API_KEY = "******";
    context.USER_CONFIG.GOOGLE_API_KEY = "******";
    context.USER_CONFIG.MISTRAL_API_KEY = "******";
    context.USER_CONFIG.COHERE_API_KEY = "******";
    context.USER_CONFIG.ANTHROPIC_API_KEY = "******";
    msg = "<pre>\n" + msg;
    msg += `USER_CONFIG: ${JSON.stringify(context.USER_CONFIG, null, 2)}
`;
    msg += `CHAT_CONTEXT: ${JSON.stringify(context.CURRENT_CHAT_CONTEXT, null, 2)}
`;
    msg += `SHARE_CONTEXT: ${JSON.stringify(shareCtx, null, 2)}
`;
    msg += "</pre>";
  }
  context.CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
  return sendMessageToTelegramWithContext(context)(msg);
}
async function commandRegenerate(message, command, subcommand, context) {
  const mf = (history, text) => {
    const { real, original } = history;
    let nextText = text;
    if (!real || !original || real.length === 0 || original.length === 0) {
      throw new Error(ENV.I18N.message.history_empty);
    }
    while (true) {
      const data = real.pop();
      original.pop();
      if (data === void 0 || data === null) {
        break;
      } else if (data.role === "user") {
        if (text === "" || text === void 0 || text === null) {
          nextText = data.content;
        }
        break;
      }
    }
    if (subcommand) {
      nextText = subcommand;
    }
    return { history: { real, original }, text: nextText };
  };
  return chatWithLLM(null, context, mf);
}
async function commandEcho(message, command, subcommand, context) {
  let msg = "<pre>";
  msg += JSON.stringify({ message }, null, 2);
  msg += "</pre>";
  context.CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
  return sendMessageToTelegramWithContext(context)(msg);
}
async function handleCommandMessage(message, context) {
  if (ENV.DEV_MODE) {
    commandHandlers["/echo"] = {
      help: "[DEBUG ONLY] echo message",
      scopes: ["all_private_chats", "all_chat_administrators"],
      fn: commandEcho,
      needAuth: commandAuthCheck.default
    };
  }
  if (CUSTOM_COMMAND[message.text]) {
    message.text = CUSTOM_COMMAND[message.text];
  }
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + " ")) {
      const command = commandHandlers[key];
      try {
        if (command.needAuth) {
          const roleList = command.needAuth(context.SHARE_CONTEXT.chatType);
          if (roleList) {
            const chatRole = await getChatRoleWithContext(context)(context.SHARE_CONTEXT.speakerId);
            if (chatRole === null) {
              return sendMessageToTelegramWithContext(context)(ENV.I18N.command.permission.not_authorized);
            }
            if (!roleList.includes(chatRole)) {
              const msg = ENV.I18N.command.permission.not_enough_permission(roleList, chatRole);
              return sendMessageToTelegramWithContext(context)(msg);
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.permission.role_error(e));
      }
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand, context);
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.permission.command_error(e));
      }
    }
  }
  return null;
}
async function bindCommandForTelegram(token) {
  const scopeCommandMap = {
    all_private_chats: [],
    all_group_chats: [],
    all_chat_administrators: []
  };
  const commands = commandSortList;
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    commands.splice(commands.indexOf("/usage"), 1);
  }
  for (const key of commands) {
    if (ENV.HIDE_COMMAND_BUTTONS.includes(key)) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(commandHandlers, key) && commandHandlers[key].scopes) {
      for (const scope of commandHandlers[key].scopes) {
        if (!scopeCommandMap[scope]) {
          scopeCommandMap[scope] = [];
        }
        scopeCommandMap[scope].push(key);
      }
    }
  }
  const result = {};
  for (const scope in scopeCommandMap) {
    result[scope] = await fetch(
      `https://api.telegram.org/bot${token}/setMyCommands`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commands: scopeCommandMap[scope].map((command) => ({
            command,
            description: ENV.I18N.command.help[command.substring(1)] || ""
          })),
          scope: {
            type: scope
          }
        })
      }
    ).then((res) => res.json());
  }
  return { ok: true, result };
}
function commandsDocument() {
  return Object.keys(commandHandlers).map((key) => {
    return {
      command: key,
      description: ENV.I18N.command.help[key.substring(1)]
    };
  });
}

// src/utils/utils.js
function renderHTML(body) {
  return `
<html>  
  <head>
    <title>ChatGPT-Telegram-Workers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="ChatGPT-Telegram-Workers">
    <meta name="author" content="TBXark">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
      }
      a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      strong {
        font-weight: bolder;
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>
  `;
}
function errorToString(e) {
  return JSON.stringify({
    message: e.message,
    stack: e.stack
  });
}
async function makeResponse200(resp) {
  if (resp === null) {
    return new Response("NOT HANDLED", { status: 200 });
  }
  if (resp.status === 200) {
    return resp;
  } else {
    return new Response(resp.body, {
      status: 200,
      headers: {
        "Original-Status": resp.status,
        ...resp.headers
      }
    });
  }
}

// src/telegram/message.js
async function msgInitChatContext(message, context) {
  await context.initContext(message);
  return null;
}
async function msgSaveLastMessage(message, context) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
  }
  return null;
}
async function msgIgnoreOldMessage(message, context) {
  if (ENV.SAFE_MODE) {
    let idList = [];
    try {
      idList = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.chatLastMessageIdKey).catch(() => "[]")) || [];
    } catch (e) {
      console.error(e);
    }
    if (idList.includes(message.message_id)) {
      throw new Error("Ignore old message");
    } else {
      idList.push(message.message_id);
      if (idList.length > 100) {
        idList.shift();
      }
      await DATABASE.put(context.SHARE_CONTEXT.chatLastMessageIdKey, JSON.stringify(idList));
    }
  }
  return null;
}
async function msgCheckEnvIsReady(message, context) {
  if (!DATABASE) {
    return sendMessageToTelegramWithContext(context)("DATABASE Not Set");
  }
  return null;
}
async function msgFilterWhiteList(message, context) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (context.SHARE_CONTEXT.chatType === "private") {
    if (!ENV.CHAT_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegramWithContext(context)(
        ENV.I18N.message.user_has_no_permission_to_use_the_bot(context.CURRENT_CHAT_CONTEXT.chat_id)
      );
    }
    return null;
  }
  if (CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      throw new Error("Not support");
    }
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegramWithContext(context)(
        ENV.I18N.message.group_has_no_permission_to_use_the_bot(context.CURRENT_CHAT_CONTEXT.chat_id)
      );
    }
    return null;
  }
  return sendMessageToTelegramWithContext(context)(
    ENV.I18N.message.not_supported_chat_type(context.SHARE_CONTEXT.chatType)
  );
}
async function msgFilterUnsupportedMessage(message, context) {
  if (!message.text) {
    throw new Error(ENV.I18N.message.not_supported_chat_type_message);
  }
  return null;
}
async function msgHandleGroupMessage(message, context) {
  if (!CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
    return null;
  }
  let botName = context.SHARE_CONTEXT.currentBotName;
  if (message.reply_to_message) {
    if (`${message.reply_to_message.from.id}` === context.SHARE_CONTEXT.currentBotId) {
      return null;
    } else if (ENV.EXTRA_MESSAGE_CONTEXT) {
      context.SHARE_CONTEXT.extraMessageContext = message.reply_to_message;
    }
  }
  if (!botName) {
    const res = await getBot(context.SHARE_CONTEXT.currentBotToken);
    context.SHARE_CONTEXT.currentBotName = res.info.bot_name;
    botName = res.info.bot_name;
  }
  if (botName) {
    let mentioned = false;
    if (message.entities) {
      let content = "";
      let offset = 0;
      message.entities.forEach((entity) => {
        switch (entity.type) {
          case "bot_command":
            if (!mentioned) {
              const mention = message.text.substring(
                entity.offset,
                entity.offset + entity.length
              );
              if (mention.endsWith(botName)) {
                mentioned = true;
              }
              const cmd = mention.replaceAll("@" + botName, "").replaceAll(botName, "").trim();
              content += cmd;
              offset = entity.offset + entity.length;
            }
            break;
          case "mention":
          case "text_mention":
            if (!mentioned) {
              const mention = message.text.substring(
                entity.offset,
                entity.offset + entity.length
              );
              if (mention === botName || mention === "@" + botName) {
                mentioned = true;
              }
            }
            content += message.text.substring(offset, entity.offset);
            offset = entity.offset + entity.length;
            break;
        }
      });
      content += message.text.substring(offset, message.text.length);
      message.text = content.trim();
    }
    if (!mentioned) {
      throw new Error("No mentioned");
    } else {
      return null;
    }
  }
  throw new Error("Not set bot name");
}
async function msgHandleCommand(message, context) {
  return await handleCommandMessage(message, context);
}
async function msgChatWithLLM(message, context) {
  let text = message.text;
  if (ENV.EXTRA_MESSAGE_CONTEXT && context.SHARE_CONTEXT.extraMessageContext && context.SHARE_CONTEXT.extraMessageContext.text) {
    text = context.SHARE_CONTEXT.extraMessageContext.text + "\n" + text;
  }
  return chatWithLLM(text, context, null);
}
async function loadMessage(request, context) {
  const raw = await request.json();
  if (raw.edited_message) {
    throw new Error("Ignore edited message");
  }
  if (raw.message) {
    return raw.message;
  } else {
    throw new Error("Invalid message");
  }
}
async function handleMessage(request) {
  const context = new Context();
  context.initTelegramContext(request);
  const message = await loadMessage(request, context);
  const handlers = [
    msgInitChatContext,
    // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群组消息), SHARE_CONTEXT
    msgCheckEnvIsReady,
    // 检查环境是否准备好: DATABASE
    msgSaveLastMessage,
    // DEBUG: 保存最后一条消息
    msgFilterUnsupportedMessage,
    // 过滤不支持的消息(抛出异常结束消息处理：当前只支持文本消息)
    msgHandleGroupMessage,
    // 处理群消息，判断是否需要响应此条消息
    msgFilterWhiteList,
    // 过滤非白名单用户
    msgIgnoreOldMessage,
    // 忽略旧消息
    msgHandleCommand,
    // 处理命令消息
    msgChatWithLLM
    // 与llm聊天
  ];
  for (const handler of handlers) {
    try {
      const result = await handler(message, context);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      console.error(e);
      return new Response(errorToString(e), { status: 500 });
    }
  }
  return null;
}

// src/router.js
var helpLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md";
var issueLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/issues";
var initLink = "./init";
var footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;
function buildKeyNotFoundHTML(key) {
  return `<p style="color: red">Please set the <strong>${key}</strong> environment variable in Cloudflare Workers.</p> `;
}
async function bindWebHookAction(request) {
  const result = [];
  const domain = new URL(request.url).host;
  const hookMode = API_GUARD ? "safehook" : "webhook";
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token.trim()}/${hookMode}`;
    const id = token.split(":")[0];
    result[id] = {
      webhook: await bindTelegramWebHook(token, url).catch((e) => errorToString(e)),
      command: await bindCommandForTelegram(token).catch((e) => errorToString(e))
    };
  }
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${domain}</h2>
    ${ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0 ? buildKeyNotFoundHTML("TELEGRAM_AVAILABLE_TOKENS") : ""}
    ${Object.keys(result).map((id) => `
        <br/>
        <h4>Bot ID: ${id}</h4>
        <p style="color: ${result[id].webhook.ok ? "green" : "red"}">Webhook: ${JSON.stringify(result[id].webhook)}</p>
        <p style="color: ${result[id].command.ok ? "green" : "red"}">Command: ${JSON.stringify(result[id].command)}</p>
        `).join("")}
      ${footer}
    `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function telegramWebhook(request) {
  try {
    return await makeResponse200(await handleMessage(request));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
async function telegramSafeHook(request) {
  try {
    if (API_GUARD === void 0 || API_GUARD === null) {
      return telegramWebhook(request);
    }
    console.log("API_GUARD is enabled");
    const url = new URL(request.url);
    url.pathname = url.pathname.replace("/safehook", "/webhook");
    request = new Request(url, request);
    return await makeResponse200(await API_GUARD.fetch(request));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
async function defaultIndexAction() {
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p> Version (ts:${ENV.BUILD_TIMESTAMP},sha:${ENV.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="${initLink}"> >>>>> click here <<<<< </a></strong> to bind the webhook.</p>
    <br/>
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${commandsDocument().map((item) => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function loadBotInfo() {
  const result = [];
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const id = token.split(":")[0];
    result[id] = await getBot(token);
  }
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <h4>Environment About Bot</h4>
    <p><strong>GROUP_CHAT_BOT_ENABLE:</strong> ${ENV.GROUP_CHAT_BOT_ENABLE}</p>
    <p><strong>GROUP_CHAT_BOT_SHARE_MODE:</strong> ${ENV.GROUP_CHAT_BOT_SHARE_MODE}</p>
    <p><strong>TELEGRAM_BOT_NAME:</strong> ${ENV.TELEGRAM_BOT_NAME.join(",")}</p>
    ${Object.keys(result).map((id) => `
            <br/>
            <h4>Bot ID: ${id}</h4>
            <p style="color: ${result[id].ok ? "green" : "red"}">${JSON.stringify(result[id])}</p>
            `).join("")}
    ${footer}
  `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  if (pathname === `/`) {
    return defaultIndexAction();
  }
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhook(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/safehook`)) {
    return telegramSafeHook(request);
  }
  if (ENV.DEV_MODE || ENV.DEBUG_MODE) {
    if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/bot`)) {
      return loadBotInfo();
    }
  }
  return null;
}

// src/i18n/zh-hans.js
var zh_hans_default = {
  env: {
    "system_init_message": "\u4F60\u662F\u4E00\u4E2A\u5F97\u529B\u7684\u52A9\u624B"
  },
  utils: {
    "not_supported_configuration": "\u4E0D\u652F\u6301\u7684\u914D\u7F6E\u9879\u6216\u6570\u636E\u7C7B\u578B\u9519\u8BEF"
  },
  message: {
    "loading": "\u52A0\u8F7D\u4E2D",
    "not_supported_chat_type": (type) => `\u6682\u4E0D\u652F\u6301${type}\u7C7B\u578B\u7684\u804A\u5929`,
    "not_supported_chat_type_message": "\u6682\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F",
    "handle_chat_type_message_error": (type) => `\u5904\u7406${type}\u7C7B\u578B\u7684\u804A\u5929\u6D88\u606F\u51FA\u9519`,
    "user_has_no_permission_to_use_the_bot": (id) => `\u4F60\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u8FD9\u4E2Abot, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u4F60\u7684ID(${id})\u5230\u767D\u540D\u5355`,
    "group_has_no_permission_to_use_the_bot": (id) => `\u8BE5\u7FA4\u672A\u5F00\u542F\u804A\u5929\u6743\u9650, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u7FA4ID(${id})\u5230\u767D\u540D\u5355`,
    "history_empty": "\u6682\u65E0\u5386\u53F2\u6D88\u606F"
  },
  command: {
    help: {
      "summary": "\u5F53\u524D\u652F\u6301\u4EE5\u4E0B\u547D\u4EE4:\n",
      "help": "\u83B7\u53D6\u547D\u4EE4\u5E2E\u52A9",
      "new": "\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
      "start": "\u83B7\u53D6\u4F60\u7684ID, \u5E76\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
      "img": "\u751F\u6210\u4E00\u5F20\u56FE\u7247, \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A `/img \u56FE\u7247\u63CF\u8FF0`, \u4F8B\u5982`/img \u6708\u5149\u4E0B\u7684\u6C99\u6EE9`",
      "version": "\u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7, \u5224\u65AD\u662F\u5426\u9700\u8981\u66F4\u65B0",
      "setenv": "\u8BBE\u7F6E\u7528\u6237\u914D\u7F6E\uFF0C\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenv KEY=VALUE",
      "setenvs": '\u6279\u91CF\u8BBE\u7F6E\u7528\u6237\u914D\u7F6E, \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}',
      "delenv": "\u5220\u9664\u7528\u6237\u914D\u7F6E\uFF0C\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /delenv KEY",
      "clearenv": "\u6E05\u9664\u6240\u6709\u7528\u6237\u914D\u7F6E",
      "usage": "\u83B7\u53D6\u5F53\u524D\u673A\u5668\u4EBA\u7684\u7528\u91CF\u7EDF\u8BA1",
      "system": "\u67E5\u770B\u5F53\u524D\u4E00\u4E9B\u7CFB\u7EDF\u4FE1\u606F",
      "redo": "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5BF9\u8BDD, /redo \u52A0\u4FEE\u6539\u8FC7\u7684\u5185\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      "echo": "\u56DE\u663E\u6D88\u606F",
      "bill": "\u67E5\u770B\u5F53\u524D\u8D26\u5355"
    },
    img: {
      "help": "\u8BF7\u8F93\u5165\u56FE\u7247\u63CF\u8FF0\u3002\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A `/img \u72F8\u82B1\u732B`"
    },
    new: {
      "new_chat_start": "\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB",
      "new_chat_start_private": (id) => `\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB\uFF0C\u4F60\u7684ID(${id})`,
      "new_chat_start_group": (id) => `\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB\uFF0C\u7FA4\u7EC4ID(${id})`
    },
    setenv: {
      "help": "\u914D\u7F6E\u9879\u683C\u5F0F\u9519\u8BEF: \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenv KEY=VALUE",
      "update_config_success": "\u66F4\u65B0\u914D\u7F6E\u6210\u529F",
      "update_config_error": (e) => `\u914D\u7F6E\u9879\u683C\u5F0F\u9519\u8BEF: ${e.message}`
    },
    version: {
      "new_version_found": (current, online) => `\u53D1\u73B0\u65B0\u7248\u672C\uFF0C\u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}\uFF0C\u6700\u65B0\u7248\u672C: ${JSON.stringify(online)}`,
      "current_is_latest_version": (current) => `\u5F53\u524D\u5DF2\u7ECF\u662F\u6700\u65B0\u7248\u672C, \u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}`
    },
    usage: {
      "usage_not_open": "\u5F53\u524D\u673A\u5668\u4EBA\u672A\u5F00\u542F\u7528\u91CF\u7EDF\u8BA1",
      "current_usage": "\u{1F4CA} \u5F53\u524D\u673A\u5668\u4EBA\u7528\u91CF\n\nTokens:\n",
      "total_usage": (total) => `- \u603B\u7528\u91CF\uFF1A${total || 0} tokens
- \u5404\u804A\u5929\u7528\u91CF\uFF1A`,
      "no_usage": "- \u6682\u65E0\u7528\u91CF"
    },
    permission: {
      "not_authorized": "\u8EAB\u4EFD\u6743\u9650\u9A8C\u8BC1\u5931\u8D25",
      "not_enough_permission": (roleList, chatRole) => `\u6743\u9650\u4E0D\u8DB3,\u9700\u8981${roleList.join(",")},\u5F53\u524D:${chatRole}`,
      "role_error": (e) => `\u8EAB\u4EFD\u9A8C\u8BC1\u51FA\u9519:` + e.message,
      "command_error": (e) => `\u547D\u4EE4\u6267\u884C\u9519\u8BEF: ${e.message}`
    },
    bill: {
      "bill_detail": (totalAmount, totalUsage, remaining) => `\u{1F4CA} \u672C\u6708\u673A\u5668\u4EBA\u7528\u91CF

	- \u603B\u989D\u5EA6: $${totalAmount || 0}
	- \u5DF2\u4F7F\u7528: $${totalUsage || 0}
	- \u5269\u4F59\u989D\u5EA6: $${remaining || 0}`
    }
  }
};

// src/i18n/zh-hant.js
var zh_hant_default = {
  env: {
    "system_init_message": "\u4F60\u662F\u4E00\u500B\u5F97\u529B\u7684\u52A9\u624B"
  },
  utils: {
    "not_supported_configuration": "\u4E0D\u652F\u6301\u7684\u914D\u7F6E\u6216\u6578\u64DA\u985E\u578B\u932F\u8AA4"
  },
  message: {
    "loading": "\u52A0\u8F7D\u4E2D",
    "not_supported_chat_type": (type) => `\u7576\u524D\u4E0D\u652F\u6301${type}\u985E\u578B\u7684\u804A\u5929`,
    "not_supported_chat_type_message": "\u7576\u524D\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F",
    "handle_chat_type_message_error": (type) => `\u8655\u7406${type}\u985E\u578B\u7684\u804A\u5929\u6D88\u606F\u51FA\u932F`,
    "user_has_no_permission_to_use_the_bot": (id) => `\u60A8\u6C92\u6709\u6B0A\u9650\u4F7F\u7528\u672C\u6A5F\u5668\u4EBA\uFF0C\u8ACB\u806F\u7E6B\u7BA1\u7406\u54E1\u5C07\u60A8\u7684ID(${id})\u6DFB\u52A0\u5230\u767D\u540D\u55AE\u4E2D`,
    "group_has_no_permission_to_use_the_bot": (id) => `\u8A72\u7FA4\u7D44\u672A\u958B\u555F\u804A\u5929\u6B0A\u9650\uFF0C\u8ACB\u806F\u7E6B\u7BA1\u7406\u54E1\u5C07\u8A72\u7FA4\u7D44ID(${id})\u6DFB\u52A0\u5230\u767D\u540D\u55AE\u4E2D`,
    "history_empty": "\u66AB\u7121\u6B77\u53F2\u6D88\u606F"
  },
  command: {
    help: {
      "summary": "\u7576\u524D\u652F\u6301\u7684\u547D\u4EE4\u5982\u4E0B\uFF1A\n",
      "help": "\u7372\u53D6\u547D\u4EE4\u5E6B\u52A9",
      "new": "\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71",
      "start": "\u7372\u53D6\u60A8\u7684ID\u4E26\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71",
      "img": "\u751F\u6210\u5716\u7247\uFF0C\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA`/img \u5716\u7247\u63CF\u8FF0`\uFF0C\u4F8B\u5982`/img \u6D77\u7058\u6708\u5149`",
      "version": "\u7372\u53D6\u7576\u524D\u7248\u672C\u865F\u78BA\u8A8D\u662F\u5426\u9700\u8981\u66F4\u65B0",
      "setenv": "\u8A2D\u7F6E\u7528\u6236\u914D\u7F6E\uFF0C\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA/setenv KEY=VALUE",
      "setenvs": '\u6279\u91CF\u8A2D\u7F6E\u7528\u6237\u914D\u7F6E, \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u70BA /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}',
      "delenv": "\u522A\u9664\u7528\u6236\u914D\u7F6E\uFF0C\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA/delenv KEY",
      "clearenv": "\u6E05\u9664\u6240\u6709\u7528\u6236\u914D\u7F6E",
      "usage": "\u7372\u53D6\u6A5F\u5668\u4EBA\u7576\u524D\u7684\u4F7F\u7528\u60C5\u6CC1\u7D71\u8A08",
      "system": "\u67E5\u770B\u4E00\u4E9B\u7CFB\u7D71\u4FE1\u606F",
      "redo": "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5C0D\u8A71 /redo \u52A0\u4FEE\u6539\u904E\u7684\u5167\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      "echo": "\u56DE\u663E\u6D88\u606F",
      "bill": "\u67E5\u770B\u7576\u524D\u7684\u8CEC\u55AE"
    },
    img: {
      "help": "\u8ACB\u8F38\u5165\u5716\u7247\u63CF\u8FF0\u3002\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA`/img raccoon cat`"
    },
    new: {
      "new_chat_start": "\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71",
      "new_chat_start_private": (id) => `\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71\uFF0C\u60A8\u7684ID(${id})`,
      "new_chat_start_group": (id) => `\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71\uFF0C\u7FA4\u7D44ID(${id})`
    },
    setenv: {
      "help": "\u914D\u7F6E\u9805\u683C\u5F0F\u932F\u8AA4\uFF1A\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA/setenv KEY=VALUE",
      "update_config_success": "\u66F4\u65B0\u914D\u7F6E\u6210\u529F",
      "update_config_error": (e) => `\u914D\u7F6E\u9805\u683C\u5F0F\u932F\u8AA4\uFF1A\`${e.message}\``
    },
    version: {
      "new_version_found": (current, online) => `\u767C\u73FE\u65B0\u7248\u672C\uFF0C\u7576\u524D\u7248\u672C\uFF1A${JSON.stringify(current)}\uFF0C\u6700\u65B0\u7248\u672C\uFF1A${JSON.stringify(online)}`,
      "current_is_latest_version": (current) => `\u7576\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C\uFF0C\u7576\u524D\u7248\u672C\uFF1A${JSON.stringify(current)}`
    },
    usage: {
      "usage_not_open": "\u7576\u524D\u6A5F\u5668\u4EBA\u672A\u958B\u555F\u4F7F\u7528\u60C5\u6CC1\u7D71\u8A08",
      "current_usage": "\u{1F4CA} \u7576\u524D\u6A5F\u5668\u4EBA\u4F7F\u7528\u60C5\u6CC1\n\n\u4F7F\u7528\u60C5\u6CC1\uFF1A\n",
      "total_usage": (total) => `- \u7E3D\u8A08\uFF1A${total || 0} \u6B21
- \u6BCF\u500B\u7FA4\u7D44\u4F7F\u7528\u60C5\u6CC1\uFF1A `,
      "no_usage": "- \u66AB\u7121\u4F7F\u7528\u60C5\u6CC1"
    },
    permission: {
      "not_authorized": "\u8EAB\u4EFD\u6B0A\u9650\u9A57\u8B49\u5931\u6557",
      "not_enough_permission": (roleList, chatRole) => `\u6B0A\u9650\u4E0D\u8DB3\uFF0C\u9700\u8981${roleList.join(",")}\uFF0C\u7576\u524D\uFF1A${chatRole}`,
      "role_error": (e) => `\u8EAB\u4EFD\u9A57\u8B49\u51FA\u932F\uFF1A` + e.message,
      "command_error": (e) => `\u547D\u4EE4\u57F7\u884C\u51FA\u932F\uFF1A${e.message}`
    },
    bill: {
      "bill_detail": (totalAmount, totalUsage, remaining) => `\u{1F4CA} \u672C\u6708\u673A\u5668\u4EBA\u7528\u91CF

	- \u603B\u989D\u5EA6: $${totalAmount || 0}
	- \u5DF2\u4F7F\u7528: $${totalUsage || 0}
	- \u5269\u4F59\u989D\u5EA6: $${remaining || 0}`
    }
  }
};

// src/i18n/en.js
var en_default = {
  env: {
    "system_init_message": "You are a helpful assistant"
  },
  utils: {
    "not_supported_configuration": "Not supported configuration or data type error"
  },
  message: {
    "loading": "Loading",
    "not_supported_chat_type": (type) => `Currently not supported ${type} type of chat`,
    "not_supported_chat_type_message": "Currently not supported non-text format messages",
    "handle_chat_type_message_error": (type) => `Error handling ${type} type of chat messages`,
    "user_has_no_permission_to_use_the_bot": (id) => `You do not have permission to use this bot, please contact the administrator to add your ID (${id}) to the whitelist`,
    "group_has_no_permission_to_use_the_bot": (id) => `The group has not enabled chat permissions, please contact the administrator to add the group ID (${id}) to the whitelist`,
    "history_empty": "No history messages"
  },
  command: {
    help: {
      "summary": "The following commands are currently supported:\n",
      "help": "Get command help",
      "new": "Start a new conversation",
      "start": "Get your ID and start a new conversation",
      "img": "Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`",
      "version": "Get the current version number to determine whether to update",
      "setenv": "Set user configuration, the complete command format is /setenv KEY=VALUE",
      "setenvs": 'Batch set user configurations, the full format of the command is /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}',
      "delenv": "Delete user configuration, the complete command format is /delenv KEY",
      "clearenv": "Clear all user configuration",
      "usage": "Get the current usage statistics of the robot",
      "system": "View some system information",
      "redo": "Redo the last conversation, /redo with modified content or directly /redo",
      "echo": "Echo the message",
      "bill": "View current bill"
    },
    img: {
      "help": "Please enter the image description. The complete command format is `/img raccoon cat`"
    },
    new: {
      "new_chat_start": "A new conversation has started",
      "new_chat_start_private": (id) => `A new conversation has started, your ID (${id})`,
      "new_chat_start_group": (id) => `A new conversation has started, group ID (${id})`
    },
    setenv: {
      "help": "Configuration item format error: the complete command format is /setenv KEY=VALUE",
      "update_config_success": "Update configuration successfully",
      "update_config_error": (e) => `Configuration item format error: ${e.message}`
    },
    version: {
      "new_version_found": (current, online) => `New version found, current version: ${JSON.stringify(current)}, latest version: ${JSON.stringify(online)}`,
      "current_is_latest_version": (current) => `Current is the latest version, current version: ${JSON.stringify(current)}`
    },
    usage: {
      "usage_not_open": "The current robot is not open for usage statistics",
      "current_usage": "\u{1F4CA} Current robot usage\n\nTokens:\n",
      "total_usage": (total) => `- Total: ${total || 0} tokens
- Per chat usage: `,
      "no_usage": "- No usage"
    },
    permission: {
      "not_authorized": "Identity permission verification failed",
      "not_enough_permission": (roleList, chatRole) => `Insufficient permissions, need ${roleList.join(",")}, current: ${chatRole}`,
      "role_error": (e) => `Identity verification error: ` + e.message,
      "command_error": (e) => `Command execution error: ${e.message}`
    },
    bill: {
      "bill_detail": (totalAmount, totalUsage, remaining) => `\u{1F4CA} This month usage

	- Amount: $${totalAmount || 0}
	- Usage: $${totalUsage || 0}
	- Remaining: $${remaining || 0}`
    }
  }
};

// src/i18n/index.js
function i18n(lang) {
  switch (lang.toLowerCase()) {
    case "cn":
    case "zh-cn":
    case "zh-hans":
      return zh_hans_default;
    case "zh-tw":
    case "zh-hk":
    case "zh-mo":
    case "zh-hant":
      return zh_hant_default;
    case "en":
    case "en-us":
      return en_default;
  }
}

// main.js
var main_default = {
  async fetch(request, env) {
    try {
      initEnv(env, i18n);
      const resp = await handleRequest(request);
      return resp || new Response("NOTFOUND", { status: 404 });
    } catch (e) {
      console.error(e);
      return new Response(errorToString(e), { status: 500 });
    }
  }
};
export {
  main_default as default
};
