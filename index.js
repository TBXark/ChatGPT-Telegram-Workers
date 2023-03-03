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
// KV Namespace Bindings
let DATABASE = null;

const USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: '你是一个得力的助手',
  // OpenAI API 额外参数
  OPENAI_API_EXTRA_PARAMS: {},
};

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

// /////// --  初始化

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
}

async function initUserConfig(id) {
  try {
    const userConfig = await DATABASE.get(`user_config:${id}`).then(
        (res) => JSON.parse(res) || {},
    );
    for (const key in userConfig) {
      if (USER_CONFIG.hasOwnProperty(key)) {
        USER_CONFIG[key] = userConfig[key];
      }
    }
  } catch (e) {
    console.error(e);
  }
}

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
  return sendMessageToTelegram(
      '你没有权限使用这个命令, 请请联系管理员添加你的Token到白名单',
      TELEGRAM_TOKEN,
      message.chat.id,
  );
}

// /////// --  Router

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

async function telegramWebhookAction(request) {
  // token 预处理
  const {pathname} = new URL(request.url);
  const token = pathname.match(/^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/)[1];
  const tokenError = await initTelegramToken(token, request);
  if (tokenError) {
    return tokenError;
  }

  // 加载用户配置
  const {message} = await request.json();
  if (message?.chat?.id) {
    await initUserConfig(message.chat.id);
  }

  const handlers = [
    msgCheckEnvIsReady,
    msgFilterWhiteList,
    msgFilterUnknownTextMessage,
    msgUpdateUserConfig,
    msgCreateNewChatContext,
    msgChatWithOpenAI,
  ];


  for (const handler of handlers) {
    try {
      const result = await handler(message);
      if (result) {
        return result;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return new Response('OK', {status: 200});
}


// /////// --  Handler

// 检查环境变量是否设置
async function msgCheckEnvIsReady(message) {
  if (!API_KEY) {
    return sendMessageToTelegram(
        'OpenAI API Key 未设置',
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
  if (!DATABASE) {
    return sendMessageToTelegram(
        'DATABASE 未设置',
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
  return null;
}

// 过滤非白名单用户
async function msgFilterWhiteList(message) {
  if (I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (!CHAT_WHITE_LIST.includes(`${message.chat.id}`)) {
    return sendMessageToTelegram(
        `你没有权限使用这个命令, 请请联系管理员添加你的ID(${message.chat.id})到白名单`,
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
  return null;
}

// 过滤非文本消息
async function msgFilterUnknownTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram(
        '暂不支持非文本格式消息',
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
  return null;
}

// 用户配置修改
async function msgUpdateUserConfig(message) {
  if (!message.text.startsWith('SETENV')) {
    return null;
  }
  const regex = /^SETENV\s+(\w+)\s*=\s*(.*)$/;
  try {
    const match = message.text.match(regex);
    const key = match[1];
    const value = match[2];
    if (!USER_CONFIG.hasOwnProperty(key)) {
      return sendMessageToTelegram(
          '不支持的配置项',
          TELEGRAM_TOKEN,
          message.chat.id,
      );
    }
    USER_CONFIG[key] = value;
    await DATABASE.put(
        `user_config:${message.chat.id}`,
        JSON.stringify(USER_CONFIG),
    );
    return sendMessageToTelegram(
        '更新配置成功',
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  } catch (e) {
    console.error(e);
  }
  return sendMessageToTelegram(
      '配置项格式错误: SETENV KEY=VALUE',
      TELEGRAM_TOKEN,
      message.chat.id,
  );
}

// 新的对话
async function msgCreateNewChatContext(message) {
  if (message.text !== '/new') {
    return null;
  }
  try {
    await DATABASE.delete(`history:${message.chat.id}`);
    return sendMessageToTelegram(
        '新的对话已经开始',
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  } catch (e) {
    return sendMessageToTelegram(
        `ERROR: ${e.message}`,
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
}

// 聊天
async function msgChatWithOpenAI(message) {
  try {
    const historyKey = `history:${message.chat.id}`;
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
    return sendMessageToTelegram(answer, TELEGRAM_TOKEN, message.chat.id);
  } catch (e) {
    return sendMessageToTelegram(
        `ERROR: ${e.message}`,
        TELEGRAM_TOKEN,
        message.chat.id,
    );
  }
}

// /////// --  API

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

async function sendMessageToTelegram(message, token, chatId) {
  return await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}
