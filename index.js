// / --  环境变量
// 推荐在Workers配置界面填写环境变量， 而不是直接修改这些变量
// OpenAI API Key
let API_KEY = null;
// Telegram Bot Token
let TELEGRAM_TOKEN = null;
// Available Telegram Bot Tokens
let TELEGRAM_AVAILABLE_TOKENS = null;
// Workers Domain
let WORKERS_DOMAIN = null;
// Disable white list
let I_AM_A_GENEROUS_PERSON = false;
// Chat White List
let CHAT_WHITE_LIST = [];
// Telegram Bot Username
let BOT_NAME = null;
// Group Chat Bot Share History
let GROUP_CHAT_BOT_SHARE_MODE = false;
// Debug Mode
let DEBUG_MODE = false;


// / --  KV数据库
// KV Namespace Bindings
let DATABASE = null;

// / --  数据库配置
// 用户配置
const USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: '你是一个得力的助手',
  // OpenAI API 额外参数
  OPENAI_API_EXTRA_PARAMS: {},
};


// / -- 共享上下文
// 当前聊天上下文
const CURRENR_CHAT_CONTEXT = {
  chat_id: null,
  parse_mode: 'Markdown',
};

// 共享上下文
const SHARE_CONTEXT = {
  currentBotId: null,
  chatHistoryKey: null, // history:user_id:bot_id:group_id
  configStoreKey: null, // user_config:user_id:bot_id
};


// / --  初始化
// 初始化全局环境变量
function initGlobalEnv(env) {
  if (env.API_KEY) {
    API_KEY = env.API_KEY;
  }
  if (env.TELEGRAM_TOKEN) {
    TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
  }
  if (env.CHAT_WHITE_LIST) {
    CHAT_WHITE_LIST = env.CHAT_WHITE_LIST.split(',');
  }
  if (env.TELEGRAM_AVAILABLE_TOKENS) {
    TELEGRAM_AVAILABLE_TOKENS = env.TELEGRAM_AVAILABLE_TOKENS.split(',');
  }
  if (env.WORKERS_DOMAIN) {
    WORKERS_DOMAIN = env.WORKERS_DOMAIN;
  }
  if (env.I_AM_A_GENEROUS_PERSON) {
    I_AM_A_GENEROUS_PERSON = (env.I_AM_A_GENEROUS_PERSON || 'false') === 'true';
  }
  if (env.DATABASE) {
    DATABASE = env.DATABASE;
  }
  if (env.BOT_NAME) {
    BOT_NAME = env.BOT_NAME;
  }
  if (env.GROUP_CHAT_BOT_SHARE_MODE) {
    GROUP_CHAT_BOT_SHARE_MODE = (env.GROUP_CHAT_BOT_SHARE_MODE || 'false') === 'true';
  }
  if (env.DEBUG_MODE) {
    DEBUG_MODE = (env.DEBUG_MODE || 'false') === 'true';
  }
}

// 初始化用户配置
async function initUserConfig(id) {
  try {
    const userConfig = await DATABASE.get(SHARE_CONTEXT.configStoreKey).then(
        (res) => JSON.parse(res) || {},
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

// 初始化当前Telegram Token
async function initTelegramToken(token, request) {
  if (TELEGRAM_TOKEN && TELEGRAM_TOKEN === token) {
    return null;
  }
  if (TELEGRAM_AVAILABLE_TOKENS && Array.isArray(TELEGRAM_AVAILABLE_TOKENS)) {
    if (TELEGRAM_AVAILABLE_TOKENS.includes(token)) {
      TELEGRAM_TOKEN = token;
      return null;
    }
  }
  const {message} = await request.json();
  if (message?.chat?.id) {
    return sendMessageToTelegram(
        '你没有权限使用这个命令, 请请联系管理员添加你的Token到白名单',
        token,
        {chat_id: message.chat.id},
    );
  } else {
    return new Response('你没有权限使用这个命令, 请请联系管理员添加你的Token到白名单', {status: 200});
  }
}

// / --  Router
// 绑定Telegram回调
async function bindWebHookAction() {
  const result = [];
  const tokenSet = new Set();
  if (TELEGRAM_TOKEN) {
    tokenSet.add(TELEGRAM_TOKEN);
  }
  if (TELEGRAM_AVAILABLE_TOKENS && Array.isArray(TELEGRAM_AVAILABLE_TOKENS)) {
    TELEGRAM_AVAILABLE_TOKENS.forEach((token) => tokenSet.add(token));
  }
  for (const token of tokenSet) {
    const resp = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://${WORKERS_DOMAIN}/telegram/${token}/webhook`,
          }),
        },
    ).then((res) => res.json());
    result.push(resp);
  }
  return new Response(JSON.stringify(result), {status: 200});
}

// 处理Telegram回调
async function telegramWebhookAction(request) {
  // token 预处理
  const {pathname} = new URL(request.url);
  const token = pathname.match(/^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/)[1];
  const tokenError = await initTelegramToken(token, request);
  if (tokenError) {
    return tokenError;
  }
  if (TELEGRAM_AVAILABLE_TOKENS && Array.isArray(TELEGRAM_AVAILABLE_TOKENS) && TELEGRAM_AVAILABLE_TOKENS.length > 1) {
    // 如果有多个BOT，需要设置currentBotId
    SHARE_CONTEXT.currentBotId = token.split(':')[0];
  }
  // 消息处理中间件
  const {message} = await request.json();

  if (DEBUG_MODE) {
    await DATABASE.put(`last_message:${message?.chat?.id}`, JSON.stringify(message));
  }

  const handlers = [
    msgInitChatContext,
    msgCheckEnvIsReady,
    msgFilterWhiteList,
    msgHandleGroupMessage,
    msgFilterNonTextMessage,
    msgHandleCommand,
    msgChatWithOpenAI,
  ];

  for (const handler of handlers) {
    try {
      const result = await handler(message);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return new Response('NOT HANDLED', {status: 200});
}

// / --  Command
// 命令绑定
const commandHandlers = {
  '/help': {
    help: '获取命令帮助',
    fn: commandGetHelp,
  },
  '/new': {
    help: '发起新的对话',
    fn: commandCreateNewChatContext,
  },
  '/start': {
    help: '获取你的ID，并发起新的对话',
    fn: commandCreateNewChatContext,
  },
  '/setenv': {
    help: '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
    fn: commandUpdateUserConfig,
  },
};

// 命令帮助
async function commandGetHelp(message, command, subcommand) {
  let helpMsg='当前支持以下命令:\n';
  for (const key in commandHandlers) {
    helpMsg+=key+'：'+commandHandlers[key].help+'\n';
  }
  return sendMessageToTelegram(
      helpMsg,
  );
}

// 新的会话
async function commandCreateNewChatContext(message, command, subcommand) {
  try {
    await DATABASE.delete(SHARE_CONTEXT.chatHistoryKey);
    if (command==='/new') {
      return sendMessageToTelegram(
          '新的对话已经开始',
      );
    } else {
      if (CURRENR_CHAT_CONTEXT.reply_to_message_id) {
        return sendMessageToTelegram(
            `新的对话已经开始，群组ID(${CURRENR_CHAT_CONTEXT.chat_id})，你的ID(${message.from.id})`,
        );
      } else {
        return sendMessageToTelegram(
            `新的对话已经开始，你的ID(${CURRENR_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegram(
        `ERROR: ${e.message}`,
    );
  }
}


// 用户配置修改
async function commandUpdateUserConfig(message, command, subcommand) {
  const kv = subcommand.indexOf('=');
  if (kv === -1) {
    return sendMessageToTelegram(
        '配置项格式错误: 命令完整格式为 /setenv KEY=VALUE',
    );
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  try {
    switch (typeof USER_CONFIG[key]) {
      case 'number':
        USER_CONFIG[key] = Number(value);
        break;
      case 'boolean':
        USER_CONFIG[key] = value === 'true';
        break;
      case 'string':
        USER_CONFIG[key] = value;
        break;
      case 'array':
        const array = JSON.parse(value);
        if ( Array.isArray(array)) {
          USER_CONFIG[key] = array;
          break;
        }
        return sendMessageToTelegram(
            '不支持的配置项或数据类型错误',
        );
      case 'object':
        const object = JSON.parse(value);
        if ( typeof object === 'object') {
          USER_CONFIG[key] = object;
          break;
        }
        return sendMessageToTelegram(
            '不支持的配置项或数据类型错误',
        );
      default:
        return sendMessageToTelegram(
            '不支持的配置项或数据类型错误',
        );
    }
    await DATABASE.put(SHARE_CONTEXT.configStoreKey, JSON.stringify(USER_CONFIG));
    return sendMessageToTelegram(
        '更新配置成功',
    );
  } catch (e) {
    return sendMessageToTelegram(
        `配置项格式错误: ${e.message}`,
    );
  }
}

// / --  Handler
// 初始化聊天上下文
async function msgInitChatContext(message) {
  const id = message?.chat?.id;
  if (id === undefined || id === null) {
    return new Response('ID NOT FOUND', {status: 200});
  }

  let historyKey = `history:${id}`;
  let configStoreKey = `user_config:${id}`;

  await initUserConfig(id);
  CURRENR_CHAT_CONTEXT.chat_id = id;

  if (SHARE_CONTEXT.currentBotId) {
    historyKey += `:${SHARE_CONTEXT.currentBotId}`;
  }

  // 标记群组消息
  if (message.chat.type === 'group') {
    CURRENR_CHAT_CONTEXT.reply_to_message_id = message.message_id;
    if (!GROUP_CHAT_BOT_SHARE_MODE && message.from.id) {
      historyKey += `:${message.from.id}`;
    }
  }

  if (SHARE_CONTEXT.currentBotId) {
    configStoreKey += `:${SHARE_CONTEXT.currentBotId}`;
  }

  SHARE_CONTEXT.chatHistoryKey = historyKey;
  SHARE_CONTEXT.configStoreKey = configStoreKey;
  return null;
}

// 检查环境变量是否设置
async function msgCheckEnvIsReady(message) {
  if (!API_KEY) {
    return sendMessageToTelegram(
        'OpenAI API Key 未设置',
    );
  }
  if (!DATABASE) {
    return sendMessageToTelegram(
        'DATABASE 未设置',
    );
  }
  return null;
}

// 过滤非白名单用户
async function msgFilterWhiteList(message) {
  // 对群组消息放行
  if (CURRENR_CHAT_CONTEXT.reply_to_message_id) {
    return null;
  }
  if (I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (!CHAT_WHITE_LIST.includes(`${CURRENR_CHAT_CONTEXT.chat_id}`)) {
    return sendMessageToTelegram(
        `你没有权限使用这个命令, 请请联系管理员添加你的ID(${CURRENR_CHAT_CONTEXT.chat_id})到白名单`,
    );
  }
  return null;
}

// 过滤非文本消息
async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram(
        '暂不支持非文本格式消息',
    );
  }
  return null;
}

// 处理群消息
async function msgHandleGroupMessage(message) {
  // 处理群组消息，过滤掉AT部分
  if (BOT_NAME && CURRENR_CHAT_CONTEXT.reply_to_message_id) {
    if (!message.text) {
      return new Response('NON TEXT MESSAGE', {status: 200});
    }
    let mentioned = false;
    if (message.entities) {
      let content = '';
      let offset = 0;
      message.entities.forEach((entity) => {
        switch (entity.type) {
          case 'bot_command':
            if (!mentioned) {
              const mention = message.text.substring(entity.offset, entity.offset + entity.length);
              if (mention.endsWith(BOT_NAME)) {
                mentioned = true;
              }
              const cmd = mention.replaceAll('@' + BOT_NAME, '').replaceAll(BOT_NAME).trim();
              content += cmd;
              offset = entity.offset + entity.length;
            }
            break;
          case 'mention':
          case 'text_mention':
            if (!mentioned) {
              const mention = message.text.substring(entity.offset, entity.offset + entity.length);
              if (mention === BOT_NAME || mention === '@' + BOT_NAME) {
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
    // 未AT机器人的消息不作处理
    if (!mentioned) {
      return new Response('NOT MENTIONED', {status: 200});
    }
  }
  return null;
}

// 响应命令消息
async function msgHandleCommand(message) {
  for (const key in commandHandlers) {
    if (message.text===key || message.text.startsWith(key+' ')) {
      const command = commandHandlers[key];
      const subcommand = message.text.substr(key.length).trim();
      return await command.fn(message, key, subcommand);
    }
  }
  return null;
}

// 聊天
async function msgChatWithOpenAI(message) {
  try {
    const historyKey = SHARE_CONTEXT.chatHistoryKey;
    let history = [];
    try {
      history = await DATABASE.get(historyKey).then((res) => JSON.parse(res));
    } catch (e) {
      console.error(e);
    }
    if (!history || !Array.isArray(history) || history.length === 0) {
      history = [{role: 'system', content: USER_CONFIG.SYSTEM_INIT_MESSAGE}];
    }
    const answer = await sendMessageToChatGPT(message.text, history);
    history.push({role: 'user', content: message.text});
    history.push({role: 'assistant', content: answer});
    await DATABASE.put(historyKey, JSON.stringify(history));
    return sendMessageToTelegram(answer, TELEGRAM_TOKEN);
  } catch (e) {
    return sendMessageToTelegram(
        `ERROR: ${e.message}`,
    );
  }
}

// / --  API
// 发送消息到ChatGPT
async function sendMessageToChatGPT(message, history) {
  try {
    const body = {
      model: 'gpt-3.5-turbo',
      ...USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
      messages: [
        ...(history || []),
        {role: 'user', content: message},
      ],
    };
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    if (resp.error?.message) {
      return `OpenAI API 错误\n> ${resp.error.message}}`;
    }
    return resp.choices[0].message.content;
  } catch (e) {
    console.error(e);
    return `我不知道该怎么回答\n> ${e.message}}`;
  }
}

// 发送消息到Telegram
async function sendMessageToTelegram(message, token, context) {
  return await fetch(`https://api.telegram.org/bot${token || TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(context || CURRENR_CHAT_CONTEXT),
      text: message,
    }),
  });
}


// / --  Main
export default {
  async fetch(request, env) {
    try {
      initGlobalEnv(env);
      const {pathname} = new URL(request.url);
      if (pathname.startsWith(`/init`)) {
        return bindWebHookAction();
      }
      if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
        return telegramWebhookAction(request);
      }
      return new Response('NOTFOUND: ' + pathname, {status: 404});
    } catch (e) {
      console.error(e);
      return new Response('ERROR:' + e.message, {status: 200});
    }
  },
};
