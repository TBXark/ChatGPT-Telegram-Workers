// src/env.js
var ENV_VALUE_TYPE = {
  API_KEY: "string"
};
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
  // 调试模式
  DEBUG_MODE: false,
  // 开发模式
  DEV_MODE: false,
  // 当前版本
  BUILD_TIMESTAMP: 1678442956,
  // 当前版本 commit id
  BUILD_VERSION: "c760014",
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE: "\u4F60\u662F\u4E00\u4E2A\u5F97\u529B\u7684\u52A9\u624B",
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE: "system",
  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS: true,
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS: [],
  // Inline keyboard: 实验性功能请勿开启
  INLINE_KEYBOARD_ENABLE: ["private", "group", "supergroup"]
};
var CONST = {
  PASSWORD_KEY: "chat_history_password",
  GROUP_TYPES: ["group", "supergroup"]
};
var DATABASE = null;
function initEnv(env) {
  DATABASE = env.DATABASE;
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
}

// src/context.js
var USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
  // OpenAI API 额外参数
  OPENAI_API_EXTRA_PARAMS: {}
};
var CURRENT_CHAT_CONTEXT = {
  chat_id: null,
  reply_to_message_id: null,
  // 如果是群组，这个值为消息ID，否则为null
  parse_mode: "Markdown"
};
var SHARE_CONTEXT = {
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
  speakerId: null
  // 发言人 id
};
function initChatContext(chatId, replyToMessageId) {
  CURRENT_CHAT_CONTEXT.chat_id = chatId;
  CURRENT_CHAT_CONTEXT.reply_to_message_id = replyToMessageId;
  if (replyToMessageId) {
    CURRENT_CHAT_CONTEXT.allow_sending_without_reply = true;
  }
}
async function initUserConfig(storeKey) {
  try {
    const userConfig = JSON.parse(await DATABASE.get(storeKey));
    for (const key in userConfig) {
      if (USER_CONFIG.hasOwnProperty(key) && typeof USER_CONFIG[key] === typeof userConfig[key]) {
        USER_CONFIG[key] = userConfig[key];
      }
    }
  } catch (e) {
    console.error(e);
  }
}
async function initShareContext(message, request) {
  const { pathname } = new URL(request.url);
  const token = pathname.match(
    /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/
  )[1];
  const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
  if (telegramIndex === -1) {
    throw new Error("Token not allowed");
  }
  SHARE_CONTEXT.currentBotToken = token;
  SHARE_CONTEXT.currentBotId = token.split(":")[0];
  SHARE_CONTEXT.usageKey = `usage:${SHARE_CONTEXT.currentBotId}`;
  if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
    SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
  }
  const id = message?.chat?.id;
  if (id === void 0 || id === null) {
    throw new Error("Chat id not found");
  }
  const botId = SHARE_CONTEXT.currentBotId;
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
  SHARE_CONTEXT.chatHistoryKey = historyKey;
  SHARE_CONTEXT.configStoreKey = configStoreKey;
  SHARE_CONTEXT.groupAdminKey = groupAdminKey;
  SHARE_CONTEXT.chatType = message.chat?.type;
  SHARE_CONTEXT.chatId = message.chat.id;
  SHARE_CONTEXT.speakerId = message.from.id || message.chat.id;
}
async function initContext(message, request) {
  console.log(ENV);
  const chatId = message?.chat?.id;
  const replyId = CONST.GROUP_TYPES.includes(message.chat?.type) ? message.message_id : null;
  initChatContext(chatId, replyId);
  console.log(CURRENT_CHAT_CONTEXT);
  await initShareContext(message, request);
  console.log(SHARE_CONTEXT);
  await initUserConfig(SHARE_CONTEXT.configStoreKey);
  console.log(USER_CONFIG);
}

// src/telegram.js
async function sendMessage(message, token, context) {
  return await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
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
  console.log("\u53D1\u9001\u6D88\u606F:\n", message);
  const botToken = token || SHARE_CONTEXT.currentBotToken;
  const chatContext = context || CURRENT_CHAT_CONTEXT;
  if (message.length <= 4096) {
    return await sendMessage(message, botToken, chatContext);
  }
  console.log("\u6D88\u606F\u5C06\u5206\u6BB5\u53D1\u9001");
  const limit = 4e3;
  chatContext.parse_mode = "HTML";
  for (let i = 0; i < string.length; i += limit) {
    const msg = message.slice(i, i + limit);
    await sendMessage(`<pre>
${msg}
</pre>`, botToken, chatContext);
  }
  return new Response("MESSAGE BATCH SEND", { status: 200 });
}
async function sendPhotoToTelegram(url, token, context) {
  const chatContext = Object.assign(context || CURRENT_CHAT_CONTEXT, { parse_mode: null });
  return await fetch(
    `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/sendPhoto`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...chatContext,
        photo: url
      })
    }
  );
}
async function sendChatActionToTelegram(action, token) {
  return await fetch(
    `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/sendChatAction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CURRENT_CHAT_CONTEXT.chat_id,
        action
      })
    }
  ).then((res) => res.json());
}
async function deleteMessageInlineKeyboard(chatId, messageId, token) {
  return await fetch(
    `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/editMessageReplyMarkup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: []
        }
      })
    }
  ).then((res) => res.json());
}
async function bindTelegramWebHook(token, url) {
  return await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
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
async function getChatRole(id) {
  let groupAdmin;
  try {
    groupAdmin = JSON.parse(await DATABASE.get(SHARE_CONTEXT.groupAdminKey));
  } catch (e) {
    console.error(e);
    return e.message;
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(CURRENT_CHAT_CONTEXT.chat_id);
    if (administers == null) {
      return null;
    }
    groupAdmin = administers;
    await DATABASE.put(
      SHARE_CONTEXT.groupAdminKey,
      JSON.stringify(groupAdmin),
      { expiration: parseInt(Date.now() / 1e3) + 120 }
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
async function getChatAdminister(chatId, token) {
  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/getChatAdministrators`,
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
    `https://api.telegram.org/bot${token}/getMe`,
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

// src/openai.js
async function requestCompletionsFromChatGPT(message, history) {
  const body = {
    model: ENV.CHAT_MODEL,
    ...USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...history || [], { role: "user", content: message }]
  };
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.API_KEY}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API \u9519\u8BEF
> ${resp.error.message}`);
  }
  setTimeout(() => updateBotUsage(resp.usage).catch(console.error), 0);
  return resp.choices[0].message.content;
}
async function requestImageFromOpenAI(prompt) {
  const body = {
    prompt,
    n: 1,
    size: "512x512"
  };
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.API_KEY}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API \u9519\u8BEF
> ${resp.error.message}`);
  }
  return resp.data[0].url;
}
async function updateBotUsage(usage) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return;
  }
  let dbValue = JSON.parse(await DATABASE.get(SHARE_CONTEXT.usageKey));
  if (!dbValue) {
    dbValue = {
      tokens: {
        total: 0,
        chats: {}
      }
    };
  }
  dbValue.tokens.total += usage.total_tokens;
  if (!dbValue.tokens.chats[SHARE_CONTEXT.chatId]) {
    dbValue.tokens.chats[SHARE_CONTEXT.chatId] = usage.total_tokens;
  } else {
    dbValue.tokens.chats[SHARE_CONTEXT.chatId] += usage.total_tokens;
  }
  await DATABASE.put(SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}

// src/command.js
var commandAuthCheck = {
  default: function() {
    if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
      return ["administrator", "creator"];
    }
    return false;
  },
  shareModeGroup: function() {
    if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
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
    help: "\u83B7\u53D6\u547D\u4EE4\u5E2E\u52A9",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandGetHelp
  },
  "/new": {
    help: "\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
    scopes: ["all_private_chats", "all_group_chats", "all_chat_administrators"],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/start": {
    help: "\u83B7\u53D6\u4F60\u7684ID\uFF0C\u5E76\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.default
  },
  "/img": {
    help: "\u751F\u6210\u4E00\u5F20\u56FE\u7247",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandGenerateImg,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/version": {
    help: "\u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7, \u5224\u65AD\u662F\u5426\u9700\u8981\u66F4\u65B0",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandFetchUpdate,
    needAuth: commandAuthCheck.default
  },
  "/setenv": {
    help: "\u8BBE\u7F6E\u7528\u6237\u914D\u7F6E\uFF0C\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenv KEY=VALUE",
    scopes: [],
    fn: commandUpdateUserConfig,
    needAuth: commandAuthCheck.shareModeGroup
  },
  "/usage": {
    help: "\u83B7\u53D6\u5F53\u524D\u673A\u5668\u4EBA\u7684\u7528\u91CF\u7EDF\u8BA1",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandUsage,
    needAuth: commandAuthCheck.default
  },
  "/system": {
    help: "\u67E5\u770B\u5F53\u524D\u4E00\u4E9B\u7CFB\u7EDF\u4FE1\u606F",
    scopes: ["all_private_chats", "all_chat_administrators"],
    fn: commandSystem,
    needAuth: commandAuthCheck.default
  }
};
async function commandGenerateImg(message, command, subcommand) {
  if (subcommand === "") {
    return sendMessageToTelegram("\u8BF7\u8F93\u5165\u56FE\u7247\u63CF\u8FF0\u3002\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A `/img \u72F8\u82B1\u732B`");
  }
  try {
    setTimeout(() => sendChatActionToTelegram("upload_photo").catch(console.error), 0);
    const imgUrl = await requestImageFromOpenAI(subcommand);
    try {
      return sendPhotoToTelegram(imgUrl);
    } catch (e) {
      return sendMessageToTelegram(`\u56FE\u7247:
${imgUrl}`);
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR:IMG: ${e.message}`);
  }
}
async function commandGetHelp(message, command, subcommand) {
  const helpMsg = "\u5F53\u524D\u652F\u6301\u4EE5\u4E0B\u547D\u4EE4:\n" + Object.keys(commandHandlers).map((key) => `${key}\uFF1A${commandHandlers[key].help}`).join("\n");
  return sendMessageToTelegram(helpMsg);
}
async function commandCreateNewChatContext(message, command, subcommand) {
  try {
    await DATABASE.delete(SHARE_CONTEXT.chatHistoryKey);
    if (command === "/new") {
      return sendMessageToTelegram("\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB");
    } else {
      if (SHARE_CONTEXT.chatType === "private") {
        return sendMessageToTelegram(
          `\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB\uFF0C\u4F60\u7684ID(${CURRENT_CHAT_CONTEXT.chat_id})`
        );
      } else {
        return sendMessageToTelegram(
          `\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB\uFF0C\u7FA4\u7EC4ID(${CURRENT_CHAT_CONTEXT.chat_id})`
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}
async function commandUpdateUserConfig(message, command, subcommand) {
  const kv = subcommand.indexOf("=");
  if (kv === -1) {
    return sendMessageToTelegram(
      "\u914D\u7F6E\u9879\u683C\u5F0F\u9519\u8BEF: \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenv KEY=VALUE"
    );
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  try {
    switch (typeof USER_CONFIG[key]) {
      case "number":
        USER_CONFIG[key] = Number(value);
        break;
      case "boolean":
        USER_CONFIG[key] = value === "true";
        break;
      case "string":
        USER_CONFIG[key] = value;
        break;
      case "object":
        const object = JSON.parse(value);
        if (typeof object === "object") {
          USER_CONFIG[key] = object;
          break;
        }
        return sendMessageToTelegram("\u4E0D\u652F\u6301\u7684\u914D\u7F6E\u9879\u6216\u6570\u636E\u7C7B\u578B\u9519\u8BEF");
      default:
        return sendMessageToTelegram("\u4E0D\u652F\u6301\u7684\u914D\u7F6E\u9879\u6216\u6570\u636E\u7C7B\u578B\u9519\u8BEF");
    }
    await DATABASE.put(
      SHARE_CONTEXT.configStoreKey,
      JSON.stringify(USER_CONFIG)
    );
    return sendMessageToTelegram("\u66F4\u65B0\u914D\u7F6E\u6210\u529F");
  } catch (e) {
    return sendMessageToTelegram(`\u914D\u7F6E\u9879\u683C\u5F0F\u9519\u8BEF: ${e.message}`);
  }
}
async function commandFetchUpdate(message, command, subcommand) {
  const config = {
    headers: {
      "User-Agent": "TBXark/ChatGPT-Telegram-Workers"
    }
  };
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION
  };
  const ts = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/timestamp";
  const info = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/buildinfo.json";
  let online = await fetch(info, config).then((r) => r.json()).catch(() => null);
  if (!online) {
    online = await fetch(ts).then((r) => r.text()).then((ts2) => ({ ts: Number(ts2.trim()), sha: "unknown" })).catch(() => ({ ts: 0, sha: "unknown" }));
  }
  if (current.ts < online.ts) {
    return sendMessageToTelegram(
      ` \u53D1\u73B0\u65B0\u7248\u672C\uFF0C\u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}\uFF0C\u6700\u65B0\u7248\u672C: ${JSON.stringify(online)}`
    );
  } else {
    return sendMessageToTelegram(`\u5F53\u524D\u5DF2\u7ECF\u662F\u6700\u65B0\u7248\u672C, \u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}`);
  }
}
async function commandUsage() {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return sendMessageToTelegram("\u5F53\u524D\u673A\u5668\u4EBA\u672A\u5F00\u542F\u7528\u91CF\u7EDF\u8BA1");
  }
  const usage = JSON.parse(await DATABASE.get(SHARE_CONTEXT.usageKey));
  let text = "\u{1F4CA} \u5F53\u524D\u673A\u5668\u4EBA\u7528\u91CF\n\nTokens:\n";
  if (usage?.tokens) {
    const { tokens } = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort((a, b) => tokens.chats[b] - tokens.chats[a]);
    text += `- \u603B\u7528\u91CF\uFF1A${tokens.total || 0} tokens
- \u5404\u804A\u5929\u7528\u91CF\uFF1A`;
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
    text += "- \u6682\u65E0\u7528\u91CF";
  }
  return sendMessageToTelegram(text);
}
async function commandSystem(message) {
  let msg = "\u5F53\u524D\u7CFB\u7EDF\u4FE1\u606F\u5982\u4E0B:\n";
  msg += "OpenAI\u6A21\u578B:" + ENV.CHAT_MODEL + "\n";
  if (ENV.DEBUG_MODE) {
    msg += "<pre>";
    msg += `USER_CONFIG: 
${JSON.stringify(USER_CONFIG, null, 2)}
`;
    if (ENV.DEV_MODE) {
      const shareCtx = { ...SHARE_CONTEXT };
      shareCtx.currentBotToken = "ENPYPTED";
      msg += `CHAT_CONTEXT: 
${JSON.stringify(CURRENT_CHAT_CONTEXT, null, 2)}
`;
      msg += `SHARE_CONTEXT: 
${JSON.stringify(shareCtx, null, 2)}
`;
    }
    msg += "</pre>";
  }
  CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
  return sendMessageToTelegram(msg);
}
async function commandEcho(message) {
  let msg = "<pre>";
  msg += JSON.stringify({ message }, null, 2);
  msg += "</pre>";
  CURRENT_CHAT_CONTEXT.parse_mode = "HTML";
  return sendMessageToTelegram(msg);
}
async function handleCommandMessage(message) {
  if (ENV.DEV_MODE) {
    commandHandlers["/echo"] = {
      help: "[DEBUG ONLY]\u56DE\u663E\u6D88\u606F",
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
          const roleList = command.needAuth();
          if (roleList) {
            const chatRole = await getChatRole(SHARE_CONTEXT.speakerId);
            if (chatRole === null) {
              return sendMessageToTelegram("\u8EAB\u4EFD\u6743\u9650\u9A8C\u8BC1\u5931\u8D25");
            }
            if (!roleList.includes(chatRole)) {
              return sendMessageToTelegram(`\u6743\u9650\u4E0D\u8DB3,\u9700\u8981${roleList.join(",")},\u5F53\u524D:${chatRole}`);
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegram(`\u8EAB\u4EFD\u9A8C\u8BC1\u51FA\u9519:` + e.message);
      }
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand);
      } catch (e) {
        return sendMessageToTelegram(`\u547D\u4EE4\u6267\u884C\u9519\u8BEF: ${e.message}`);
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
            description: commandHandlers[command].help
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
    const command = commandHandlers[key];
    return {
      command: key,
      description: command.help
    };
  });
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

// src/message.js
var MAX_TOKEN_LENGTH = 2048;
async function msgInitChatContext(message, request) {
  try {
    await initContext(message, request);
  } catch (e) {
    return new Response(errorToString(e), { status: 200 });
  }
  return null;
}
async function msgSaveLastMessage(message) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message));
  }
  return null;
}
async function msgCheckEnvIsReady(message) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegram("OpenAI API Key \u672A\u8BBE\u7F6E");
  }
  if (!DATABASE) {
    return sendMessageToTelegram("DATABASE \u672A\u8BBE\u7F6E");
  }
  return null;
}
async function msgFilterWhiteList(message) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (SHARE_CONTEXT.chatType === "private") {
    if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
        `\u4F60\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u8FD9\u4E2A\u547D\u4EE4, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u4F60\u7684ID(${CURRENT_CHAT_CONTEXT.chat_id})\u5230\u767D\u540D\u5355`
      );
    }
    return null;
  }
  if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      return new Response("ID SUPPORT", { status: 401 });
    }
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
        `\u8BE5\u7FA4\u672A\u5F00\u542F\u804A\u5929\u6743\u9650, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u7FA4ID(${CURRENT_CHAT_CONTEXT.chat_id})\u5230\u767D\u540D\u5355`
      );
    }
    return null;
  }
  return sendMessageToTelegram(
    `\u6682\u4E0D\u652F\u6301\u8BE5\u7C7B\u578B(${SHARE_CONTEXT.chatType})\u7684\u804A\u5929`
  );
}
async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram("\u6682\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F");
  }
  return null;
}
async function msgHandleGroupMessage(message) {
  if (!message.text) {
    return new Response("NON TEXT MESSAGE", { status: 200 });
  }
  const botName = SHARE_CONTEXT.currentBotName;
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
              const cmd = mention.replaceAll("@" + botName, "").replaceAll(botName).trim();
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
      return new Response("NOT MENTIONED", { status: 200 });
    } else {
      return null;
    }
  }
  return new Response("NOT SET BOTNAME", { status: 200 });
  ;
}
async function msgHandleCommand(message) {
  return await handleCommandMessage(message);
}
async function msgChatWithOpenAI(message) {
  try {
    console.log("\u63D0\u95EE\u6D88\u606F:" + message.text || "");
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    setTimeout(() => sendChatActionToTelegram("typing").catch(console.error), 0);
    const historyKey = SHARE_CONTEXT.chatHistoryKey;
    const { real: history, fake: fakeHistory } = await loadHistory(historyKey);
    const answer = await requestCompletionsFromChatGPT(message.text, fakeHistory || history);
    if (!historyDisable) {
      history.push({ role: "user", content: message.text || "" });
      history.push({ role: "assistant", content: answer });
      await DATABASE.put(historyKey, JSON.stringify(history)).catch(console.error);
    }
    if (SHARE_CONTEXT.chatType && ENV.INLINE_KEYBOARD_ENABLE.includes(SHARE_CONTEXT.chatType)) {
      const replyMarkup = {};
      replyMarkup.inline_keyboard = [[
        {
          text: "\u7EE7\u7EED",
          callback_data: `#continue`
        },
        {
          text: "\u7ED3\u675F",
          callback_data: `#end`
        }
      ]];
      CURRENT_CHAT_CONTEXT.reply_markup = replyMarkup;
    }
    return sendMessageToTelegram(answer);
  } catch (e) {
    return sendMessageToTelegram(`ERROR:CHAT: ${e.message}`);
  }
}
async function msgProcessByChatType(message) {
  const handlerMap = {
    "private": [
      msgFilterWhiteList,
      msgFilterNonTextMessage,
      msgHandleCommand
    ],
    "group": [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand
    ],
    "supergroup": [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand
    ]
  };
  if (!handlerMap.hasOwnProperty(SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegram(
      `\u6682\u4E0D\u652F\u6301\u8BE5\u7C7B\u578B(${SHARE_CONTEXT.chatType})\u7684\u804A\u5929`
    );
  }
  const handlers = handlerMap[SHARE_CONTEXT.chatType];
  for (const handler of handlers) {
    try {
      const result = await handler(message);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      console.error(e);
      return sendMessageToTelegram(
        `\u5904\u7406(${SHARE_CONTEXT.chatType})\u7684\u804A\u5929\u6D88\u606F\u51FA\u9519`
      );
    }
  }
  return null;
}
async function loadMessage(request) {
  const raw = await request.json();
  console.log(raw);
  if (ENV.DEV_MODE) {
    setTimeout(() => {
      DATABASE.put(`log:${(/* @__PURE__ */ new Date()).toISOString()}`, JSON.stringify(raw), { expirationTtl: 600 }).catch(console.error);
    });
  }
  if (raw.message) {
    return raw.message;
  } else if (raw.callback_query && raw.callback_query.message) {
    const messageId = raw.callback_query.message?.message_id;
    const chatId = raw.callback_query.message?.chat?.id;
    const data = raw.callback_query.data;
    if (data.startsWith("#continue")) {
      raw.callback_query.message.text = "\u7EE7\u7EED";
    } else if (data.startsWith("#end")) {
      raw.callback_query.message.text = "/new";
    }
    if (messageId && chatId) {
      setTimeout(() => deleteMessageInlineKeyboard(chatId, messageId).catch(console.error), 0);
    }
    return raw.callback_query.message;
  } else {
    throw new Error("Invalid message");
  }
}
async function loadHistory(key) {
  const initMessage = { role: "system", content: USER_CONFIG.SYSTEM_INIT_MESSAGE };
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  if (historyDisable) {
    return { real: [initMessage] };
  }
  let history = [];
  try {
    history = JSON.parse(await DATABASE.get(key));
  } catch (e) {
    console.error(e);
  }
  if (!history || !Array.isArray(history) || history.length === 0) {
    history = [];
  }
  if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
    if (history.length > ENV.MAX_HISTORY_LENGTH) {
      history = history.splice(history.length - ENV.MAX_HISTORY_LENGTH);
    }
    let tokenLength = Array.from(initMessage.content).length;
    for (let i = history.length - 1; i >= 0; i--) {
      const historyItem = history[i];
      let length = 0;
      if (historyItem.content) {
        length = Array.from(historyItem.content).length;
      } else {
        historyItem.content = "";
      }
      tokenLength += length;
      if (tokenLength > MAX_TOKEN_LENGTH) {
        history = history.splice(i + 1);
        break;
      }
    }
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
    const fake = [
      ...history
    ];
    fake[0] = {
      ...fake[0],
      role: ENV.SYSTEM_INIT_MESSAGE_ROLE
    };
    return { real: history, fake };
  }
  return { real: history };
}
async function handleMessage(request) {
  const message = await loadMessage(request);
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
      const result = await handler(message, request);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      return new Response(errorToString(e), { status: 500 });
    }
  }
  return null;
}

// src/router.js
var helpLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/DEPLOY.md";
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
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token.trim()}/webhook`;
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
  const history = await DATABASE.get(historyKey).then((res) => JSON.parse(res));
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
  const resp = await handleMessage(request);
  return resp || new Response("NOT HANDLED", { status: 200 });
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
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/history`)) {
    return loadChatHistory(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    try {
      const resp = await telegramWebhook(request);
      if (resp.status === 200) {
        return resp;
      } else {
        return new Response(resp.body, { status: 200, headers: {
          "Original-Status": resp.status,
          ...resp.headers
        } });
      }
    } catch (e) {
      return new Response(errorToString(e), { status: 200 });
    }
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/bot`)) {
    return loadBotInfo(request);
  }
  return null;
}

// main.js
var main_default = {
  async fetch(request, env) {
    try {
      initEnv(env);
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
