// src/env.js
var ENV = {
  // OpenAI API Key
  API_KEY: null,
  // OpenAI的模型名称
  CHAT_MODEL: "gpt-3.5-turbo",
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS: [],
  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME: [],
  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON: false,
  // 白名单
  CHAT_WHITE_LIST: [],
  // 群组白名单
  CHAT_GROUP_WHITE_LIST: [],
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE: true,
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE: false,
  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY: true,
  // 最大历史记录长度
  MAX_HISTORY_LENGTH: 20,
  // 最大消息长度
  MAX_TOKEN_LENGTH: 2048,
  // 使用GPT3的TOKEN计数
  GPT3_TOKENS_COUNT: false,
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE: "You are a helpful assistant",
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE: "system",
  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS: false,
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS: ["/role"],
  // 检查更新的分支
  UPDATE_BRANCH: "master",
  // 当前版本
  BUILD_TIMESTAMP: 1680598939,
  // 当前版本 commit id
  BUILD_VERSION: "dcf6af4",
  /**
  * @type {I18n}
  */
  I18N: null,
  // 语言
  LANGUAGE: "zh-cn",
  // DEBUG 专用
  // 调试模式
  DEBUG_MODE: false,
  // 开发模式
  DEV_MODE: false,
  // 本地调试专用
  TELEGRAM_API_DOMAIN: "https://api.telegram.org",
  OPENAI_API_DOMAIN: "https://api.openai.com"
};
var CONST = {
  PASSWORD_KEY: "chat_history_password",
  GROUP_TYPES: ["group", "supergroup"],
  USER_AGENT: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"
};
var DATABASE = null;
var API_GUARD = null;
var ENV_VALUE_TYPE = {
  API_KEY: "string"
};
function initEnv(env, i18n2) {
  DATABASE = env.DATABASE;
  API_GUARD = env.API_GUARD;
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key] || typeof ENV[key]) {
        case "number":
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case "boolean":
          ENV[key] = (env[key] || "false") === "true";
          break;
        case "string":
          ENV[key] = env[key];
          break;
        case "object":
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(",");
          } else {
            try {
              ENV[key] = JSON.parse(env[key]);
            } catch (e) {
              console.error(e);
            }
          }
          break;
        default:
          ENV[key] = env[key];
          break;
      }
    }
  }
  {
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
  }
  ENV.I18N = i18n2((ENV.LANGUAGE || "cn").toLowerCase());
  ENV.SYSTEM_INIT_MESSAGE = ENV.I18N.env.system_init_message;
  console.log(ENV);
}

// src/context.js
var Context = class {
  // 用户配置
  USER_CONFIG = {
    // 系统初始化消息
    SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
    // OpenAI API 额外参数
    OPENAI_API_EXTRA_PARAMS: {},
    // OenAI API Key
    OPENAI_API_KEY: null
  };
  USER_DEFINE = {
    // 自定义角色
    ROLE: {}
  };
  // 当前聊天上下文
  CURRENT_CHAT_CONTEXT = {
    chat_id: null,
    reply_to_message_id: null,
    // 如果是群组，这个值为消息ID，否则为null
    parse_mode: "Markdown"
  };
  // 共享上下文
  SHARE_CONTEXT = {
    currentBotId: null,
    // 当前机器人 ID
    currentBotToken: null,
    // 当前机器人 Token
    currentBotName: null,
    // 当前机器人名称: xxx_bot
    chatHistoryKey: null,
    // history:chat_id:bot_id:(from_id)
    configStoreKey: null,
    // user_config:chat_id:bot_id:(from_id)
    groupAdminKey: null,
    // group_admin:group_id
    usageKey: null,
    // usage:bot_id
    chatType: null,
    // 会话场景, private/group/supergroup 等, 来源 message.chat.type
    chatId: null,
    // 会话 id, private 场景为发言人 id, group/supergroup 场景为群组 id
    speakerId: null,
    // 发言人 id
    role: null
    // 角色
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
      for (const key in userConfig) {
        if (key === "USER_DEFINE" && typeof this.USER_DEFINE === typeof userConfig[key]) {
          this._initUserDefine(userConfig[key]);
        } else {
          if (this.USER_CONFIG.hasOwnProperty(key) && typeof this.USER_CONFIG[key] === typeof userConfig[key]) {
            this.USER_CONFIG[key] = userConfig[key];
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  /**
   * @inner
   * @param {object} userDefine
   */
  _initUserDefine(userDefine) {
    for (const key in userDefine) {
      if (this.USER_DEFINE.hasOwnProperty(key) && typeof this.USER_DEFINE[key] === typeof userDefine[key]) {
        this.USER_DEFINE[key] = userDefine[key];
      }
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
    this.SHARE_CONTEXT.chatHistoryKey = historyKey;
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
    console.log(this.CURRENT_CHAT_CONTEXT);
    await this._initShareContext(message);
    console.log(this.SHARE_CONTEXT);
    await this._initUserConfig(this.SHARE_CONTEXT.configStoreKey);
    console.log(this.USER_CONFIG);
  }
};

// src/telegram.js
async function sendMessage(message, token, context) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...context,
        text: message
      })
    }
  );
}
async function sendMessageToTelegram(message, token, context) {
  console.log("Send Message:\n", message);
  const chatContext = context;
  if (message.length <= 4096) {
    const resp = await sendMessage(message, token, chatContext);
    if (resp.status === 200) {
      return resp;
    } else {
    }
  }
  const limit = 4e3;
  chatContext.parse_mode = "HTML";
  for (let i = 0; i < message.length; i += limit) {
    const msg = message.slice(i, i + limit);
    await sendMessage(`<pre>
${msg}
</pre>`, token, chatContext);
  }
  return new Response("Message batch send", { status: 200 });
}
function sendMessageToTelegramWithContext(context) {
  return async (message) => {
    return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
  };
}
async function sendPhotoToTelegram(url, token, context) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendPhoto`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...context,
        photo: url,
        parse_mode: null
      })
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

// src/gpt3.js
async function resourceLoader(key, url) {
  try {
    const raw = await DATABASE.get(key);
    if (raw && raw !== "") {
      return raw;
    }
  } catch (e) {
    console.error(e);
  }
  try {
    const bpe = await fetch(url, {
      headers: {
        "User-Agent": CONST.USER_AGENT
      }
    }).then((x) => x.text());
    await DATABASE.put(key, bpe);
    return bpe;
  } catch (e) {
    console.error(e);
  }
  return null;
}
async function gpt3TokensCounter() {
  const repo = "https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master";
  const encoder = await resourceLoader("encoder_raw_file", `${repo}/encoder.json`).then((x) => JSON.parse(x));
  const bpe_file = await resourceLoader("bpe_raw_file", `${repo}/vocab.bpe`);
  const range = (x, y) => {
    const res = Array.from(Array(y).keys()).slice(x);
    return res;
  };
  const ord = (x) => {
    return x.charCodeAt(0);
  };
  const chr = (x) => {
    return String.fromCharCode(x);
  };
  const textEncoder = new TextEncoder("utf-8");
  const encodeStr = (str) => {
    return Array.from(textEncoder.encode(str)).map((x) => x.toString());
  };
  const dictZip = (x, y) => {
    const result = {};
    x.map((_, i) => {
      result[x[i]] = y[i];
    });
    return result;
  };
  function bytes_to_unicode() {
    const bs = range(ord("!"), ord("~") + 1).concat(range(ord("\xA1"), ord("\xAC") + 1), range(ord("\xAE"), ord("\xFF") + 1));
    let cs = bs.slice();
    let n = 0;
    for (let b = 0; b < 2 ** 8; b++) {
      if (!bs.includes(b)) {
        bs.push(b);
        cs.push(2 ** 8 + n);
        n = n + 1;
      }
    }
    cs = cs.map((x) => chr(x));
    const result = {};
    bs.map((_, i) => {
      result[bs[i]] = cs[i];
    });
    return result;
  }
  function get_pairs(word) {
    const pairs = /* @__PURE__ */ new Set();
    let prev_char = word[0];
    for (let i = 1; i < word.length; i++) {
      const char = word[i];
      pairs.add([prev_char, char]);
      prev_char = char;
    }
    return pairs;
  }
  const pat = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
  const decoder = {};
  Object.keys(encoder).map((x) => {
    decoder[encoder[x]] = x;
  });
  const lines = bpe_file.split("\n");
  const bpe_merges = lines.slice(1, lines.length - 1).map((x) => {
    return x.split(/(\s+)/).filter(function(e) {
      return e.trim().length > 0;
    });
  });
  const byte_encoder = bytes_to_unicode();
  const byte_decoder = {};
  Object.keys(byte_encoder).map((x) => {
    byte_decoder[byte_encoder[x]] = x;
  });
  const bpe_ranks = dictZip(bpe_merges, range(0, bpe_merges.length));
  const cache = /* @__PURE__ */ new Map();
  function bpe(token) {
    if (cache.has(token)) {
      return cache.get(token);
    }
    ``;
    let word = token.split("");
    let pairs = get_pairs(word);
    if (!pairs) {
      return token;
    }
    while (true) {
      const minPairs = {};
      Array.from(pairs).map((pair) => {
        const rank = bpe_ranks[pair];
        minPairs[isNaN(rank) ? 1e11 : rank] = pair;
      });
      const bigram = minPairs[Math.min(...Object.keys(minPairs).map(
        (x) => {
          return parseInt(x);
        }
      ))];
      if (!(bigram in bpe_ranks)) {
        break;
      }
      const first = bigram[0];
      const second = bigram[1];
      let new_word = [];
      let i = 0;
      while (i < word.length) {
        const j = word.indexOf(first, i);
        if (j === -1) {
          new_word = new_word.concat(word.slice(i));
          break;
        }
        new_word = new_word.concat(word.slice(i, j));
        i = j;
        if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
          new_word.push(first + second);
          i = i + 2;
        } else {
          new_word.push(word[i]);
          i = i + 1;
        }
      }
      word = new_word;
      if (word.length === 1) {
        break;
      } else {
        pairs = get_pairs(word);
      }
    }
    word = word.join(" ");
    cache.set(token, word);
    return word;
  }
  return function tokenCount(text) {
    let tokensCount = 0;
    const matches = Array.from(text.matchAll(pat)).map((x) => x[0]);
    for (let token of matches) {
      token = encodeStr(token).map((x) => {
        return byte_encoder[x];
      }).join("");
      const new_tokens = bpe(token).split(" ").map((x) => encoder[x]);
      tokensCount += new_tokens.length;
    }
    return tokensCount;
  };
}

// src/utils.js
function randomString(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
async function historyPassword() {
  let password = await DATABASE.get(CONST.PASSWORD_KEY);
  if (password === null) {
    password = randomString(32);
    await DATABASE.put(CONST.PASSWORD_KEY, password);
  }
  return password;
}
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
function mergeConfig(config, key, value) {
  switch (typeof config[key]) {
    case "number":
      config[key] = Number(value);
      break;
    case "boolean":
      config[key] = value === "true";
      break;
    case "string":
      config[key] = value;
      break;
    case "object":
      const object = JSON.parse(value);
      if (typeof object === "object") {
        config[key] = object;
        break;
      }
      throw new Error(ENV.I18N.utils.not_supported_configuration);
    default:
      throw new Error(ENV.I18N.utils.not_supported_configuration);
  }
}
async function tokensCounter() {
  let counter = (text) => Array.from(text).length;
  try {
    if (ENV.GPT3_TOKENS_COUNT) {
      counter = await gpt3TokensCounter();
    }
  } catch (e) {
    console.error(e);
  }
  return (text) => {
    try {
      return counter(text);
    } catch (e) {
      console.error(e);
      return Array.from(text).length;
    }
  };
}
function makeResponse200(resp) {
  if (resp === null) {
    return new Response("NOT HANDLED", { status: 200 });
  }
  if (resp.status === 200) {
    return resp;
  } else {
    return new Response(resp.body, { status: 200, headers: {
      "Original-Status": resp.status,
      ...resp.headers
    } });
  }
}

// src/openai.js
async function requestCompletionsFromOpenAI(message, history, context) {
  console.log(`requestCompletionsFromOpenAI: ${message}`);
  console.log(`history: ${JSON.stringify(history, null, 2)}`);
  const key = context.USER_CONFIG.OPENAI_API_KEY || ENV.API_KEY;
  const body = {
    model: ENV.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...history || [], { role: "user", content: message }]
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    if (ENV.DEV_MODE || ENV.DEV_MODE) {
      throw new Error(`OpenAI API Error
> ${resp.error.message}
Body: ${JSON.stringify(body)}`);
    } else {
      throw new Error(`OpenAI API Error
> ${resp.error.message}`);
    }
  }
  setTimeout(() => updateBotUsage(resp.usage, context).catch(console.error), 0);
  return resp.choices[0].message.content;
}
async function requestImageFromOpenAI(prompt, context) {
  console.log(`requestImageFromOpenAI: ${prompt}`);
  const key = context.USER_CONFIG.OPENAI_API_KEY || ENV.API_KEY;
  const body = {
    prompt,
    n: 1,
    size: "512x512"
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API Error
> ${resp.error.message}`);
  }
  return resp.data[0].url;
}
async function requestCompletionsFromChatGPT(text, context, modifier) {
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
  let history = await loadHistory(historyKey, context);
  if (modifier) {
    const modifierData = modifier(history, text);
    history = modifierData.history;
    text = modifierData.text;
  }
  const { real: realHistory, original: originalHistory } = history;
  const answer = await requestCompletionsFromOpenAI(text, realHistory, context);
  if (!historyDisable) {
    originalHistory.push({ role: "user", content: text || "", cosplay: context.SHARE_CONTEXT.role || "" });
    originalHistory.push({ role: "assistant", content: answer, cosplay: context.SHARE_CONTEXT.role || "" });
    await DATABASE.put(historyKey, JSON.stringify(originalHistory)).catch(console.error);
  }
  return answer;
}
async function updateBotUsage(usage, context) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return;
  }
  let dbValue = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));
  if (!dbValue) {
    dbValue = {
      tokens: {
        total: 0,
        chats: {}
      }
    };
  }
  dbValue.tokens.total += usage.total_tokens;
  if (!dbValue.tokens.chats[context.SHARE_CONTEXT.chatId]) {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] = usage.total_tokens;
  } else {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] += usage.total_tokens;
  }
  await DATABASE.put(context.SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}
async function loadHistory(key, context) {
  const initMessage = { role: "system", content: context.USER_CONFIG.SYSTEM_INIT_MESSAGE };
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
  if (context.SHARE_CONTEXT.role) {
    history = history.filter((chat) => context.SHARE_CONTEXT.role === chat.cosplay);
  }
  history.forEach((item) => {
    delete item.cosplay;
  });
  const counter = await tokensCounter();
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
    const roleCount = Math.max(Object.keys(context.USER_DEFINE.ROLE).length, 1);
    history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    original = trimHistory(original, initLength, ENV.MAX_HISTORY_LENGTH * roleCount, ENV.MAX_TOKEN_LENGTH * roleCount);
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

// src/command.js
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
    scopes: ["all_private_chats", "all_chat_administrators"],
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
  "/delenv": {
    scopes: [],
    fn: commandDeleteUserConfig,
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
  "/role": {
    scopes: ["all_private_chats"],
    fn: commandUpdateRole,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/redo": {
    scopes: ["all_private_chats", "all_group_chats", "all_chat_administrators"],
    fn: commandRegenerate,
    needAuth: commandAuthCheck.shareModeGroup
  }
};
async function commandUpdateRole(message, command, subcommand, context) {
  if (subcommand === "show") {
    const size = Object.getOwnPropertyNames(context.USER_DEFINE.ROLE).length;
    if (size === 0) {
      return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.not_defined_any_role);
    }
    let showMsg = ENV.I18N.command.role.current_defined_role(size);
    for (const role2 in context.USER_DEFINE.ROLE) {
      if (context.USER_DEFINE.ROLE.hasOwnProperty(role2)) {
        showMsg += `~${role2}:
<pre>`;
        showMsg += JSON.stringify(context.USER_DEFINE.ROLE[role2]) + "\n";
        showMsg += "</pre>";
      }
    }
    context.CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
    return sendMessageToTelegramWithContext(context)(showMsg);
  }
  const kv = subcommand.indexOf(" ");
  if (kv === -1) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.help);
  }
  const role = subcommand.slice(0, kv);
  const settings = subcommand.slice(kv + 1).trim();
  const skv = settings.indexOf("=");
  if (skv === -1) {
    if (settings === "del") {
      try {
        if (context.USER_DEFINE.ROLE[role]) {
          delete context.USER_DEFINE.ROLE[role];
          await DATABASE.put(
            context.SHARE_CONTEXT.configStoreKey,
            JSON.stringify(Object.assign(context.USER_CONFIG, { USER_DEFINE: context.USER_DEFINE }))
          );
          return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.delete_role_success);
        }
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.delete_role_error(e));
      }
    }
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.help);
  }
  const key = settings.slice(0, skv);
  const value = settings.slice(skv + 1);
  if (!context.USER_DEFINE.ROLE[role]) {
    context.USER_DEFINE.ROLE[role] = {
      // 系统初始化消息
      SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
      // OpenAI API 额外参数
      OPENAI_API_EXTRA_PARAMS: {}
    };
  }
  try {
    mergeConfig(context.USER_DEFINE.ROLE[role], key, value);
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify(Object.assign(context.USER_CONFIG, { USER_DEFINE: context.USER_DEFINE }))
    );
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.update_role_success);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.role.update_role_error(e));
  }
}
async function commandGenerateImg(message, command, subcommand, context) {
  if (subcommand === "") {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.command.img.help);
  }
  try {
    setTimeout(() => sendChatActionToTelegramWithContext(context)("upload_photo").catch(console.error), 0);
    const imgUrl = await requestImageFromOpenAI(subcommand, context);
    try {
      return sendPhotoToTelegramWithContext(context)(imgUrl);
    } catch (e) {
      return sendMessageToTelegramWithContext(context)(`${imgUrl}`);
    }
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
  try {
    mergeConfig(context.USER_CONFIG, key, value);
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
  try {
    context.USER_CONFIG[subcommand] = null;
    await DATABASE.put(
      context.SHARE_CONTEXT.configStoreKey,
      JSON.stringify(context.USER_CONFIG)
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
  let msg = "Current System Info:\n";
  msg += "OpenAI Model:" + ENV.CHAT_MODEL + "\n";
  if (ENV.DEV_MODE) {
    const shareCtx = { ...context.SHARE_CONTEXT };
    shareCtx.currentBotToken = "******";
    context.USER_CONFIG.OPENAI_API_KEY = "******";
    msg += "<pre>";
    msg += `USER_CONFIG: 
${JSON.stringify(context.USER_CONFIG, null, 2)}
`;
    msg += `CHAT_CONTEXT: 
${JSON.stringify(context.CURRENT_CHAT_CONTEXT, null, 2)}
`;
    msg += `SHARE_CONTEXT: 
${JSON.stringify(shareCtx, null, 2)}
`;
    msg += "</pre>";
  }
  context.CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
  return sendMessageToTelegramWithContext(context)(msg);
}
async function commandRegenerate(message, command, subcommand, context) {
  setTimeout(() => sendChatActionToTelegramWithContext(context)("typing").catch(console.error), 0);
  const answer = await requestCompletionsFromChatGPT(subcommand, context, (history, text) => {
    const { real, original } = history;
    let nextText = text;
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
    return { history: { real, original }, text: nextText };
  });
  return sendMessageToTelegramWithContext(context)(answer);
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
  for (const key in commandHandlers) {
    if (ENV.HIDE_COMMAND_BUTTONS.includes(key)) {
      continue;
    }
    if (commandHandlers.hasOwnProperty(key) && commandHandlers[key].scopes) {
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

// src/message.js
async function msgInitChatContext(message, context) {
  try {
    await context.initContext(message);
  } catch (e) {
    return new Response(errorToString(e), { status: 200 });
  }
  return null;
}
async function msgSaveLastMessage(message, context) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
  }
  return null;
}
async function msgCheckEnvIsReady(message, context) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegramWithContext(context)("OpenAI API Key Not Set");
  }
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
      return new Response("Not support", { status: 401 });
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
async function msgFilterNonTextMessage(message, context) {
  if (!message.text) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.message.not_supported_chat_type_message);
  }
  return null;
}
async function msgHandleGroupMessage(message, context) {
  if (!message.text) {
    return new Response("Non text message", { status: 200 });
  }
  const botName = context.SHARE_CONTEXT.currentBotName;
  if (botName) {
    let mentioned = false;
    if (message.reply_to_message) {
      if (message.reply_to_message.from.username === botName) {
        mentioned = true;
      }
    }
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
      return new Response("No mentioned", { status: 200 });
    } else {
      return null;
    }
  }
  return new Response("Not set bot name", { status: 200 });
}
async function msgHandleCommand(message, context) {
  return await handleCommandMessage(message, context);
}
async function msgHandleRole(message, context) {
  if (!message.text.startsWith("~")) {
    return null;
  }
  message.text = message.text.slice(1);
  const kv = message.text.indexOf(" ");
  if (kv === -1) {
    return null;
  }
  const role = message.text.slice(0, kv);
  const msg = message.text.slice(kv + 1).trim();
  if (context.USER_DEFINE.ROLE.hasOwnProperty(role)) {
    context.SHARE_CONTEXT.role = role;
    message.text = msg;
    const roleConfig = context.USER_DEFINE.ROLE[role];
    for (const key in roleConfig) {
      if (context.USER_CONFIG.hasOwnProperty(key) && typeof context.USER_CONFIG[key] === typeof roleConfig[key]) {
        context.USER_CONFIG[key] = roleConfig[key];
      }
    }
  }
}
async function msgChatWithOpenAI(message, context) {
  try {
    console.log("Ask:" + message.text || "");
    setTimeout(() => sendChatActionToTelegramWithContext(context)("typing").catch(console.error), 0);
    const answer = await requestCompletionsFromChatGPT(message.text, context, null);
    return sendMessageToTelegramWithContext(context)(answer);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`Error: ${e.message}`);
  }
}
async function msgProcessByChatType(message, context) {
  const handlerMap = {
    "private": [
      msgFilterWhiteList,
      msgFilterNonTextMessage,
      msgHandleCommand,
      msgHandleRole
    ],
    "group": [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
      msgHandleRole
    ],
    "supergroup": [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
      msgHandleRole
    ]
  };
  if (!handlerMap.hasOwnProperty(context.SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegramWithContext(context)(
      ENV.I18N.message.not_supported_chat_type(context.SHARE_CONTEXT.chatType)
    );
  }
  const handlers = handlerMap[context.SHARE_CONTEXT.chatType];
  for (const handler of handlers) {
    try {
      const result = await handler(message, context);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      console.error(e);
      return sendMessageToTelegramWithContext(context)(
        ENV.I18N.message.handle_chat_type_message_error(context.SHARE_CONTEXT.chatType)
      );
    }
  }
  return null;
}
async function loadMessage(request, context) {
  const raw = await request.json();
  console.log(JSON.stringify(raw));
  if (ENV.DEV_MODE) {
    setTimeout(() => {
      DATABASE.put(`log:${(/* @__PURE__ */ new Date()).toISOString()}`, JSON.stringify(raw), { expirationTtl: 600 }).catch(console.error);
    });
  }
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
    msgSaveLastMessage,
    // 保存最后一条消息
    msgCheckEnvIsReady,
    // 检查环境是否准备好: API_KEY, DATABASE
    msgProcessByChatType,
    // 根据类型对消息进一步处理
    msgChatWithOpenAI
    // 与OpenAI聊天
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
var helpLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/DEPLOY.md";
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
async function loadChatHistory(request) {
  const password = await historyPassword();
  const { pathname } = new URL(request.url);
  const historyKey = pathname.match(/^\/telegram\/(.+)\/history/)[1];
  const params = new URL(request.url).searchParams;
  const passwordParam = params.get("password");
  if (passwordParam !== password) {
    return new Response("Password Error", { status: 401 });
  }
  const history = JSON.parse(await DATABASE.get(historyKey));
  const HTML = renderHTML(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${history.map((item) => `
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${item.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${item.content}</p>
                </div>
            `).join("")}
        </div>
  `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function telegramWebhook(request) {
  try {
    return makeResponse200(await handleMessage(request));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
async function telegramSafeHook(request) {
  try {
    console.log("API_GUARD is enabled");
    const url = new URL(request.url);
    url.pathname = url.pathname.replace("/safehook", "/webhook");
    request = new Request(url, request);
    return makeResponse200(API_GUARD.fetch(request));
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
    ${ENV.API_KEY ? "" : buildKeyNotFoundHTML("API_KEY")}
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${commandsDocument().map((item) => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function gpt3TokenTest(request) {
  const text = new URL(request.url).searchParams.get("text") || "Hello World";
  const counter = await gpt3TokensCounter();
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${text}</p>
    <p>token count: ${counter(text)}</p>
    <br/>
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
    if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/history`)) {
      return loadChatHistory(request);
    }
    if (pathname.startsWith(`/gpt3/tokens/test`)) {
      return gpt3TokenTest(request);
    }
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
    "not_supported_chat_type": (type) => `\u6682\u4E0D\u652F\u6301${type}\u7C7B\u578B\u7684\u804A\u5929`,
    "not_supported_chat_type_message": "\u6682\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F",
    "handle_chat_type_message_error": (type) => `\u5904\u7406${type}\u7C7B\u578B\u7684\u804A\u5929\u6D88\u606F\u51FA\u9519`,
    "user_has_no_permission_to_use_the_bot": (id) => `\u4F60\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u8FD9\u4E2Abot, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u4F60\u7684ID(${id})\u5230\u767D\u540D\u5355`,
    "group_has_no_permission_to_use_the_bot": (id) => `\u8BE5\u7FA4\u672A\u5F00\u542F\u804A\u5929\u6743\u9650, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u7FA4ID(${id})\u5230\u767D\u540D\u5355`
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
      "delenv": "\u5220\u9664\u7528\u6237\u914D\u7F6E\uFF0C\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /delenv KEY",
      "usage": "\u83B7\u53D6\u5F53\u524D\u673A\u5668\u4EBA\u7684\u7528\u91CF\u7EDF\u8BA1",
      "system": "\u67E5\u770B\u5F53\u524D\u4E00\u4E9B\u7CFB\u7EDF\u4FE1\u606F",
      "role": "\u8BBE\u7F6E\u9884\u8BBE\u7684\u8EAB\u4EFD",
      "redo": "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5BF9\u8BDD, /redo \u52A0\u4FEE\u6539\u8FC7\u7684\u5185\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      "echo": "\u56DE\u663E\u6D88\u606F"
    },
    role: {
      "not_defined_any_role": "\u8FD8\u672A\u5B9A\u4E49\u4EFB\u4F55\u89D2\u8272",
      "current_defined_role": (size) => `\u5F53\u524D\u5DF2\u5B9A\u4E49\u7684\u89D2\u8272\u5982\u4E0B(${size}):
`,
      "help": "\u683C\u5F0F\u9519\u8BEF: \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A `/role \u64CD\u4F5C`\n\u5F53\u524D\u652F\u6301\u4EE5\u4E0B`\u64CD\u4F5C`:\n `/role show` \u663E\u793A\u5F53\u524D\u5B9A\u4E49\u7684\u89D2\u8272.\n `/role \u89D2\u8272\u540D del` \u5220\u9664\u6307\u5B9A\u540D\u79F0\u7684\u89D2\u8272.\n `/role \u89D2\u8272\u540D KEY=VALUE` \u8BBE\u7F6E\u6307\u5B9A\u89D2\u8272\u7684\u914D\u7F6E.\n  \u76EE\u524D\u4EE5\u4E0B\u8BBE\u7F6E\u9879:\n   `SYSTEM_INIT_MESSAGE`:\u521D\u59CB\u5316\u6D88\u606F\n   `OPENAI_API_EXTRA_PARAMS`:OpenAI API \u989D\u5916\u53C2\u6570\uFF0C\u5FC5\u987B\u4E3AJSON",
      "delete_role_success": "\u5220\u9664\u89D2\u8272\u6210\u529F",
      "delete_role_error": (e) => `\u5220\u9664\u89D2\u8272\u9519\u8BEF: \`${e.message}\``,
      "update_role_success": "\u66F4\u65B0\u914D\u7F6E\u6210\u529F",
      "update_role_error": (e) => `\u914D\u7F6E\u9879\u683C\u5F0F\u9519\u8BEF: \`${e.message}\``
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
    "not_supported_chat_type": (type) => `\u7576\u524D\u4E0D\u652F\u6301${type}\u985E\u578B\u7684\u804A\u5929`,
    "not_supported_chat_type_message": "\u7576\u524D\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F",
    "handle_chat_type_message_error": (type) => `\u8655\u7406${type}\u985E\u578B\u7684\u804A\u5929\u6D88\u606F\u51FA\u932F`,
    "user_has_no_permission_to_use_the_bot": (id) => `\u60A8\u6C92\u6709\u6B0A\u9650\u4F7F\u7528\u672C\u6A5F\u5668\u4EBA\uFF0C\u8ACB\u806F\u7E6B\u7BA1\u7406\u54E1\u5C07\u60A8\u7684ID(${id})\u6DFB\u52A0\u5230\u767D\u540D\u55AE\u4E2D`,
    "group_has_no_permission_to_use_the_bot": (id) => `\u8A72\u7FA4\u7D44\u672A\u958B\u555F\u804A\u5929\u6B0A\u9650\uFF0C\u8ACB\u806F\u7E6B\u7BA1\u7406\u54E1\u5C07\u8A72\u7FA4\u7D44ID(${id})\u6DFB\u52A0\u5230\u767D\u540D\u55AE\u4E2D`
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
      "delenv": "\u522A\u9664\u7528\u6236\u914D\u7F6E\uFF0C\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA/delenv KEY",
      "usage": "\u7372\u53D6\u6A5F\u5668\u4EBA\u7576\u524D\u7684\u4F7F\u7528\u60C5\u6CC1\u7D71\u8A08",
      "system": "\u67E5\u770B\u4E00\u4E9B\u7CFB\u7D71\u4FE1\u606F",
      "role": "\u8A2D\u7F6E\u9810\u8A2D\u8EAB\u4EFD",
      "redo": "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5C0D\u8A71 /redo \u52A0\u4FEE\u6539\u904E\u7684\u5167\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      "echo": "\u56DE\u663E\u6D88\u606F"
    },
    role: {
      "not_defined_any_role": "\u5C1A\u672A\u5B9A\u7FA9\u4EFB\u4F55\u89D2\u8272",
      "current_defined_role": (size) => `\u7576\u524D\u5DF2\u5B9A\u7FA9\u7684\u89D2\u8272\u5982\u4E0B(${size})\uFF1A
`,
      "help": "\u683C\u5F0F\u932F\u8AA4\uFF1A\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA`/role \u64CD\u4F5C`\n\u7576\u524D\u652F\u6301\u7684`\u64CD\u4F5C`\u5982\u4E0B\uFF1A\n `/role show` \u67E5\u770B\u7576\u524D\u5DF2\u5B9A\u7FA9\u7684\u89D2\u8272\u3002\n `/role \u89D2\u8272\u540D del` \u522A\u9664\u6307\u5B9A\u7684\u89D2\u8272\u3002\n `/role \u89D2\u8272\u540D KEY=VALUE` \u8A2D\u7F6E\u6307\u5B9A\u89D2\u8272\u7684\u914D\u7F6E\u3002\n  \u7576\u524D\u652F\u6301\u7684\u8A2D\u7F6E\u5982\u4E0B\uFF1A\n   `SYSTEM_INIT_MESSAGE`\uFF1A\u521D\u59CB\u5316\u6D88\u606F\n   `OPENAI_API_EXTRA_PARAMS`\uFF1AOpenAI API\u984D\u5916\u53C3\u6578\uFF0C\u5FC5\u9808\u70BAJSON",
      "delete_role_success": "\u522A\u9664\u89D2\u8272\u6210\u529F",
      "delete_role_error": (e) => `\u522A\u9664\u89D2\u8272\u51FA\u932F\uFF1A\`${e.message}\``,
      "update_role_success": "\u66F4\u65B0\u914D\u7F6E\u6210\u529F",
      "update_role_error": (e) => `\u914D\u7F6E\u9805\u683C\u5F0F\u932F\u8AA4\uFF1A\`${e.message}\``
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
    "not_supported_chat_type": (type) => `Currently not supported ${type} type of chat`,
    "not_supported_chat_type_message": "Currently not supported non-text format messages",
    "handle_chat_type_message_error": (type) => `Error handling ${type} type of chat messages`,
    "user_has_no_permission_to_use_the_bot": (id) => `You do not have permission to use this bot, please contact the administrator to add your ID (${id}) to the whitelist`,
    "group_has_no_permission_to_use_the_bot": (id) => `The group has not enabled chat permissions, please contact the administrator to add the group ID (${id}) to the whitelist`
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
      "delenv": "Delete user configuration, the complete command format is /delenv KEY",
      "usage": "Get the current usage statistics of the robot",
      "system": "View some system information",
      "role": "Set the preset identity",
      "redo": "Redo the last conversation, /redo with modified content or directly /redo",
      "echo": "Echo the message"
    },
    role: {
      "not_defined_any_role": "No roles have been defined yet",
      "current_defined_role": (size) => `The following roles are currently defined (${size}):
`,
      "help": "Format error: the complete command format is `/role operation`\nThe following `operation` is currently supported:\n `/role show` Display the currently defined roles.\n `/role role name del` Delete the specified role.\n `/role role name KEY=VALUE` Set the configuration of the specified role.\n  The following settings are currently supported:\n   `SYSTEM_INIT_MESSAGE`: Initialization message\n   `OPENAI_API_EXTRA_PARAMS`: OpenAI API extra parameters, must be JSON",
      "delete_role_success": "Delete role successfully",
      "delete_role_error": (e) => `Delete role error: \`${e.message}\``,
      "update_role_success": "Update configuration successfully",
      "update_role_error": (e) => `Configuration item format error: \`${e.message}\``
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
