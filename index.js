// 推荐在Workers配置界面填写环境变量， 而不是直接修改这些变量
// OpenAI API Key
let API_KEY = 'PLEASE_REPLACE_WITH_YOUR_OPENAI_API_KEY';
// Telegram Bot Username
let BOT_NAME = 'BOT_NAME';
// Telegram Bot Token
let TELEGRAM_TOKEN = 'PLEASE_REPLACE_WITH_YOUR_TELEGRAM_BOT_TOKEN';
// Workers Domain
let WORKERS_DOMAIN = 'workers_name.username.workers.dev';
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
      if (pathname.startsWith(`/telegram/${TELEGRAM_TOKEN}/webhook`)) {
        return handleTelegramWebhook(request);
      }
      if (pathname.startsWith(`/init`)) {
        return bindTelegramWebHook();
      }
      return new Response('NotFound', {status: 404});
    } catch (e) {
      console.error(e);
      return new Response('ERROR:' + e.message, {status: 200});
    }
  },
};

// ///////// 初始化

function initGlobalEnv(env) {
  if (env.BOT_NAME) {
    BOT_NAME = env.BOT_NAME;
  }
  if (env.API_KEY) {
    API_KEY = env.API_KEY;
  }
  if (env.TELEGRAM_TOKEN) {
    TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
  }
  if (env.CHAT_WHITE_LIST) {
    CHAT_WHITE_LIST = env.CHAT_WHITE_LIST.split(',');
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

// ///////// Telegram

async function bindTelegramWebHook() {
  return await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://${WORKERS_DOMAIN}/telegram/${TELEGRAM_TOKEN}/webhook`,
        }),
      },
  );
}

async function handleTelegramWebhook(request) {
  const {message} = await request.json();
  if (message?.from?.id) {
    await initUserConfig(message.from.id);
  }
  const handlers = [
    filterWhiteListHandler,
    filterPureTextMessageHandler,
    updateUserConfigWithMessage,
    newChatContextHandler,
    chatWithOpenAIHandler,
  ];
  for (const handler of handlers) {
    try {
      const result = await handler(message);
      if (result === false) {
        break
      }
      if (result) {
        return result;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return new Response('OK', {status: 200});
}

// ///////// Handler

// 过滤非白名单用户
async function filterWhiteListHandler(message) {
  // 放行群组消息
  if (message.chat.type === 'group') {
    return null;
  }
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
async function filterPureTextMessageHandler(message) {
  if (!message.text) {
    return sendMessageToTelegram(
      '暂不支持非文本格式消息',
      TELEGRAM_TOKEN,
      message.chat.id,
      message.chat.type === 'group' ? message.message_id : undefined
    );
  }
  // 替换AT符号
  if (message.chat.type === 'group') {
    let mentioned = false
    if (message.entities) {
      let content = '';
      let offset = 0;
      message.entities.forEach(entity => {
        if (entity.type === 'mention' || entity.type === 'text_mention') {
          if (!mentioned) {
            let mention = message.text.substring(entity.offset, entity.length)
            if (mention === BOT_NAME || mention === "@" + BOT_NAME) {
              mentioned = true;
            }
          }
          content += message.text.substring(offset, entity.offset)
          offset = entity.offset + entity.length
        }
      })
      content += message.text.substring(offset, message.text.length)
      message.text = content.trim()
    }
    if (!mentioned) {
      return false
    }
  }
  return null;
}

function getGroupMsgId(message) {
  return message.chat.type === 'group' ? message.message_id : undefined
}

// 用户配置修改
async function updateUserConfigWithMessage(message) {
  if (!message.text.startsWith('SETENV')) {
    return null;
  }
  const regex = /^SETENV\s+(\w+)\s*=\s*(.*)$/;
  const replyId = getGroupMsgId(message)
  try {
    const match = message.text.match(regex);
    const key = match[1];
    const value = match[2];
    if (!USER_CONFIG.hasOwnProperty(key)) {
      return sendMessageToTelegram(
        '不支持的配置项',
        TELEGRAM_TOKEN,
        message.chat.id,
        replyId
      );
    }
    USER_CONFIG[key] = value;
    await DATABASE.put(
        `user_config:${message.from.id}`,
        JSON.stringify(USER_CONFIG),
    );
    return sendMessageToTelegram(
      '更新配置成功',
      TELEGRAM_TOKEN,
      message.chat.id,
      replyId
    );
  } catch (e) {
    console.error(e);
  }
  return sendMessageToTelegram(
    '配置项格式错误: SETENV KEY=VALUE',
    TELEGRAM_TOKEN,
    message.chat.id,
    replyId
  );
}

// 新的对话
async function newChatContextHandler(message) {
  if (message.text !== '/new' && message.text !== '/start') {
    return null;
  }
  let replyId = getGroupMsgId(message)
  try {
    let historyKey = `history:${message.from.id}`;
    if (replyId) {
      historyKey = `history:${message.chat.id}:${message.from.id}`
    }
    await DATABASE.delete(historyKey);
    return sendMessageToTelegram(
      '新的对话已经开始',
      TELEGRAM_TOKEN,
      message.chat.id,
      replyId
    );
  } catch (e) {
    return sendMessageToTelegram(
      `ERROR: ${e.message}`,
      TELEGRAM_TOKEN,
      message.chat.id,
      replyId
    );
  }
}

// 聊天
async function chatWithOpenAIHandler(message) {
  let replyId = getGroupMsgId(message)
  try {
    let historyKey = `history:${message.from.id}`;
    if (replyId) {
      historyKey = `history:${message.chat.id}:${message.from.id}`
    }
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
    return sendMessageToTelegram(answer, TELEGRAM_TOKEN, message.chat.id, replyId);
  } catch (e) {
    return sendMessageToTelegram(
      `ERROR: ${e.message}`,
      TELEGRAM_TOKEN,
      message.chat.id,
      replyId
    );
  }
}

// ///////// API

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

async function sendMessageToTelegram(message, token, chatId, replay) {
  let data = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  }
  if (replay) {
    data.reply_to_message_id = replay
  }
  return await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
