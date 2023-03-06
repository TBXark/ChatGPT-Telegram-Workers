// src/env.js
var ENV = {
  // OpenAI API Key
  API_KEY: null,
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS: [],
  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME: [],
  // Workers 域名
  WORKERS_DOMAIN: null,
  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON: false,
  // 白名单
  CHAT_WHITE_LIST: [],
  // 群组白名单
  CHAT_GROUP_WHITE_LIST: [],
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE: true,
  // 群组机器人共享模式
  GROUP_CHAT_BOT_SHARE_MODE: false,
  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY: false,
  // 最大历史记录长度
  MAX_HISTORY_LENGTH: 20,
  // 调试模式
  DEBUG_MODE: false,
  // 当前版本
  BUILD_TIMESTAMP: 1678109647,
  // 当前版本 commit id
  BUILD_VERSION: "978220d"
};
var DATABASE = null;
function initEnv(env) {
  DATABASE = env.DATABASE;
  for (const key in ENV) {
    if (env[key]) {
      switch (typeof ENV[key]) {
        case "number":
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case "boolean":
          ENV[key] = (env[key] || "false") === "true";
          break;
        case "object":
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(",");
          } else {
            ENV[key] = env[key];
          }
          break;
        default:
          ENV[key] = env[key];
          break;
      }
    }
  }
  {
    if (env.TELEGRAM_TOKEN && ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0) {
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
    if (env.BOT_NAME && ENV.TELEGRAM_BOT_NAME.length === 0) {
      ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
    }
  }
}

// src/context.js
var USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: "\u4F60\u662F\u4E00\u4E2A\u5F97\u529B\u7684\u52A9\u624B",
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
  // 当前机器人ID
  currentBotToken: null,
  // 当前机器人Token
  currentBotName: null,
  // 当前机器人名称: xxx_bot
  chatHistoryKey: null,
  // history:chat_id:bot_id:(from_id)
  configStoreKey: null,
  // user_config:chat_id:bot_id:(from_id)
  groupAdminKey: null,
  // group_admin:group_id
  chatType: null,
  // 会话场景, private/group/supergroup等, 来源message.chat.type
  chatId: null,
  // 会话id, private场景为发言人id, group/supergroup场景为群组id
  speekerId: null
  // 发言人id
};
async function initUserConfig(id) {
  try {
    const userConfig = await DATABASE.get(SHARE_CONTEXT.configStoreKey).then(
      (res) => JSON.parse(res) || {}
    );
    for (const key in userConfig) {
      if (USER_CONFIG.hasOwnProperty(key) && typeof USER_CONFIG[key] === typeof userConfig[key]) {
        USER_CONFIG[key] = userConfig[key];
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// src/telegram.js
async function sendMessageToTelegram(message, token, context) {
  return await fetch(
    `https://api.telegram.org/bot${token || SHARE_CONTEXT.currentBotToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...context || CURRENT_CHAT_CONTEXT,
        text: message
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
    groupAdmin = await DATABASE.get(SHARE_CONTEXT.groupAdminKey).then(
      (res) => JSON.parse(res)
    );
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
      { expiration: Date.now() / 1e3 + 60 }
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

// src/openai.js
async function sendMessageToChatGPT(message, history) {
  try {
    const body = {
      model: "gpt-3.5-turbo",
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
      return `OpenAI API \u9519\u8BEF
> ${resp.error.message}}`;
    }
    return resp.choices[0].message.content;
  } catch (e) {
    console.error(e);
    return `\u6211\u4E0D\u77E5\u9053\u8BE5\u600E\u4E48\u56DE\u7B54
> ${e.message}}`;
  }
}

// src/command.js
var commandHandlers = {
  "/help": {
    help: "\u83B7\u53D6\u547D\u4EE4\u5E2E\u52A9",
    fn: commandGetHelp
  },
  "/new": {
    help: "\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
    fn: commandCreateNewChatContext
  },
  "/start": {
    help: "\u83B7\u53D6\u4F60\u7684ID\uFF0C\u5E76\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
    fn: commandCreateNewChatContext
  },
  "/version": {
    help: "\u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7, \u5224\u65AD\u662F\u5426\u9700\u8981\u66F4\u65B0",
    fn: commandFetchUpdate
  },
  "/setenv": {
    help: "\u8BBE\u7F6E\u7528\u6237\u914D\u7F6E\uFF0C\u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A /setenv KEY=VALUE",
    fn: commandUpdateUserConfig
  }
};
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
  const ts = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/timestamp";
  const sha = "https://api.github.com/repos/TBXark/ChatGPT-Telegram-Workers/commits/master";
  const shaValue = await fetch(sha).then((res) => res.json()).then((res) => res.sha.slice(0, 7));
  const tsValue = await fetch(ts).then((res) => res.text()).then((res) => Number(res));
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION
  };
  const online = {
    ts: tsValue,
    sha: shaValue
  };
  if (current.ts < online.ts) {
    return sendMessageToTelegram(
      ` \u53D1\u73B0\u65B0\u7248\u672C\uFF0C \u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}\uFF0C\u6700\u65B0\u7248\u672C: ${JSON.stringify(online)}`
    );
  } else {
    return sendMessageToTelegram(`\u5F53\u524D\u5DF2\u7ECF\u662F\u6700\u65B0\u7248\u672C, \u5F53\u524D\u7248\u672C: ${JSON.stringify(current)}`);
  }
}
async function handleCommandMessage(message) {
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + " ")) {
      const command = commandHandlers[key];
      const subcommand = message.text.substring(key.length).trim();
      return await command.fn(message, key, subcommand);
    }
  }
  return null;
}
async function setCommandForTelegram(token) {
  return await fetch(
    `https://api.telegram.org/bot${token}/setMyCommands`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        commands: Object.keys(commandHandlers).map((key) => ({
          command: key,
          description: commandHandlers[key].help
        }))
      })
    }
  ).then((res) => res.json());
}

// src/message.js
var MAX_TOKEN_LENGTH = 2e3;
var GROUP_TYPES = ["group", "supergroup"];
async function msgInitTelegramToken(message, request) {
  try {
    const { pathname } = new URL(request.url);
    const token = pathname.match(
      /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/
    )[1];
    const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
    if (telegramIndex === -1) {
      throw new Error("Token not found");
    }
    SHARE_CONTEXT.currentBotToken = token;
    SHARE_CONTEXT.currentBotId = token.split(":")[0];
    if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
      SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
    }
  } catch (e) {
    return new Response(
      e.message,
      { status: 200 }
    );
  }
}
async function msgInitChatContext(message) {
  const id = message?.chat?.id;
  if (id === void 0 || id === null) {
    return new Response("ID NOT FOUND", { status: 200 });
  }
  let historyKey = `history:${id}`;
  let configStoreKey = `user_config:${id}`;
  let groupAdminKey = null;
  await initUserConfig(id);
  CURRENT_CHAT_CONTEXT.chat_id = id;
  if (SHARE_CONTEXT.currentBotId) {
    historyKey += `:${SHARE_CONTEXT.currentBotId}`;
    configStoreKey += `:${SHARE_CONTEXT.currentBotId}`;
  }
  if (GROUP_TYPES.includes(message.chat?.type)) {
    CURRENT_CHAT_CONTEXT.reply_to_message_id = message.message_id;
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
  SHARE_CONTEXT.speekerId = message.from.id || message.chat.id;
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
  if (CURRENT_CHAT_CONTEXT.reply_to_message_id) {
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
        `\u8BE5\u7FA4\u672A\u5F00\u542F\u804A\u5929\u6743\u9650, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u7FA4ID(${CURRENT_CHAT_CONTEXT.chat_id})\u5230\u767D\u540D\u5355`
      );
    }
    return null;
  }
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
    return sendMessageToTelegram(
      `\u4F60\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u8FD9\u4E2A\u547D\u4EE4, \u8BF7\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u6DFB\u52A0\u4F60\u7684ID(${CURRENT_CHAT_CONTEXT.chat_id})\u5230\u767D\u540D\u5355`
    );
  }
  return null;
}
async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram("\u6682\u4E0D\u652F\u6301\u975E\u6587\u672C\u683C\u5F0F\u6D88\u606F");
  }
  return null;
}
async function msgHandleGroupMessage(message) {
  if (!ENV.GROUP_CHAT_BOT_ENABLE) {
    return null;
  }
  const botName = SHARE_CONTEXT.currentBotName;
  if (botName && GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    if (!message.text) {
      return new Response("NON TEXT MESSAGE", { status: 200 });
    }
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
    }
  }
  return null;
}
async function msgHandleCommand(message) {
  try {
    if (GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
      const chatRole = await getChatRole(SHARE_CONTEXT.speekerId);
      if (chatRole === null) {
        return sendMessageToTelegram("\u8EAB\u4EFD\u6743\u9650\u9A8C\u8BC1\u5931\u8D25");
      }
      if (!["administrator", "creator"].includes(chatRole)) {
        return sendMessageToTelegram("\u4F60\u4E0D\u662F\u7BA1\u7406\u5458\uFF0C\u65E0\u6743\u64CD\u4F5C");
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`\u8EAB\u4EFD\u9A8C\u8BC1\u51FA\u9519:` + e.message);
  }
  return await handleCommandMessage(message);
}
async function msgChatWithOpenAI(message) {
  try {
    sendChatActionToTelegram("typing").then(console.log).catch(console.error);
    const historyKey = SHARE_CONTEXT.chatHistoryKey;
    let history = [];
    try {
      history = await DATABASE.get(historyKey).then((res) => JSON.parse(res));
    } catch (e) {
      console.error(e);
    }
    if (!history || !Array.isArray(history) || history.length === 0) {
      history = [{ role: "system", content: USER_CONFIG.SYSTEM_INIT_MESSAGE }];
    }
    if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
      if (history.length > ENV.MAX_HISTORY_LENGTH) {
        history.splice(history.length - ENV.MAX_HISTORY_LENGTH + 2);
      }
      let tokenLength = 0;
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
          history.splice(i);
          break;
        }
      }
    }
    const answer = await sendMessageToChatGPT(message.text, history);
    history.push({ role: "user", content: message.text || "" });
    history.push({ role: "assistant", content: answer });
    await DATABASE.put(historyKey, JSON.stringify(history));
    return sendMessageToTelegram(answer);
  } catch (e) {
    return sendMessageToTelegram(`ERROR:CHAT: ${e.message}`);
  }
}
async function handleMessage(request) {
  const { message } = await request.json();
  const handlers = [
    msgInitTelegramToken,
    // 初始化token
    msgInitChatContext,
    // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群组消息), SHARE_CONTEXT
    msgSaveLastMessage,
    // 保存最后一条消息
    msgCheckEnvIsReady,
    // 检查环境是否准备好: API_KEY, DATABASE
    msgFilterWhiteList,
    // 检查白名单
    msgHandleGroupMessage,
    // 处理群聊消息
    msgFilterNonTextMessage,
    // 过滤非文本消息
    msgHandleCommand,
    // 处理命令
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
      console.error(e);
    }
  }
  return null;
}

// src/router.js
async function bindWebHookAction() {
  const result = {};
  let domain = ENV.WORKERS_DOMAIN;
  if (domain.toLocaleLowerCase().startsWith("http")) {
    domain = new URL(domain).host;
  }
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token}/webhook`;
    const id = token.split(":")[0];
    result[id] = {
      webhook: await bindTelegramWebHook(token, url),
      command: await setCommandForTelegram(token)
    };
  }
  return new Response(JSON.stringify(result), { status: 200 });
}
async function telegramWebhookAction(request) {
  const resp = await handleMessage(request);
  return resp || new Response("NOT HANDLED", { status: 200 });
}
async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction();
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhookAction(request);
  }
  if (pathname.startsWith(`/env`)) {
    return new Response(JSON.stringify(ENV), { status: 200 });
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
      return new Response("ERROR:" + e.message, { status: 200 });
    }
  }
};
export {
  main_default as default
};
