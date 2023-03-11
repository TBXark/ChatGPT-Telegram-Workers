import {ENV, DATABASE, CONST} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, CURRENT_CHAT_CONTEXT, initUserConfig} from './context.js';
import {sendMessageToTelegram, sendChatActionToTelegram} from './telegram.js';
import {sendMessageToChatGPT} from './openai.js';
import {handleCommandMessage} from './command.js';
import {errorToString} from './utils.js';

const MAX_TOKEN_LENGTH = 2048;

// 初始化當前Telegram Token
async function msgInitTelegramToken(message, request) {
  try {
    const {pathname} = new URL(request.url);
    const token = pathname.match(
        /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/,
    )[1];
    const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
    if (telegramIndex === -1) {
      throw new Error('Token not found');
    }
    SHARE_CONTEXT.currentBotToken = token;
    SHARE_CONTEXT.currentBotId = token.split(':')[0];
    SHARE_CONTEXT.usageKey = `usage:${SHARE_CONTEXT.currentBotId}`;
    if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
      SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
    }
  } catch (e) {
    return new Response(
        e.message,
        {status: 200},
    );
  }
}


// 初始化聊天上下文
async function msgInitChatContext(message) {
  const id = message?.chat?.id;
  if (id === undefined || id === null) {
    return new Response('ID NOT FOUND', {status: 200});
  }

  /*
  message_id每次都在變的。
  私聊消息中：
    message.chat.id 是發言人id
  群組消息中：
    message.chat.id 是群id
    message.from.id 是發言人id

   沒有開啟群組共享模式時，要加上發言人id
   chatHistoryKey = history:chat_id:bot_id:(from_id)
   configStoreKey =  user_config:chat_id:bot_id:(from_id)
  * */

  let historyKey = `history:${id}`;
  let configStoreKey = `user_config:${id}`;
  let groupAdminKey = null;

  CURRENT_CHAT_CONTEXT.chat_id = id;

  if (SHARE_CONTEXT.currentBotId) {
    historyKey += `:${SHARE_CONTEXT.currentBotId}`;
    configStoreKey += `:${SHARE_CONTEXT.currentBotId}`;
  }

  // 標記群組消息
  if (CONST.GROUP_TYPES.includes(message.chat?.type)) {
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

  await initUserConfig(configStoreKey);

  return null;
}


async function msgSaveLastMessage(message) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message));
  }
  return null;
}


// 檢查環境變量是否設置
async function msgCheckEnvIsReady(message) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegram('OpenAI API Key 未設置');
  }
  if (!DATABASE) {
    return sendMessageToTelegram('DATABASE 未設置');
  }
  return null;
}

// 過濾非白名單用戶
async function msgFilterWhiteList(message) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  // 判斷私聊消息
  if (SHARE_CONTEXT.chatType==='private') {
    // 白名單判斷
    if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
          `你沒有權限使用這個命令, 請請聯系管理員添加你的ID(${CURRENT_CHAT_CONTEXT.chat_id})到白名單`,
      );
    }
    return null;
  } else if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    // 未打開群組機器人開關,直接忽略
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      return new Response('ID SUPPORT', {status: 200});
    }
    // 白名單判斷
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
          `該群未開啟聊天權限, 請請聯系管理員添加群ID(${CURRENT_CHAT_CONTEXT.chat_id})到白名單`,
      );
    }
    return null;
  }
  return sendMessageToTelegram(
      `暫不支持該類型(${SHARE_CONTEXT.chatType})的聊天`,
  );
}

// 過濾非文本消息
async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram('暫不支持非文本格式消息');
  }
  return null;
}

// 處理群消息
async function msgHandleGroupMessage(message) {
  // 非文本消息直接忽略
  if (!message.text) {
    return new Response('NON TEXT MESSAGE', {status: 200});
  }
  // 處理群組消息，過濾掉AT部分
  const botName = SHARE_CONTEXT.currentBotName;
  if (botName) {
    let mentioned = false;
    // Reply消息
    if (message.reply_to_message) {
      if (message.reply_to_message.from.username === botName) {
        mentioned = true;
      }
    }
    if (message.entities) {
      let content = '';
      let offset = 0;
      message.entities.forEach((entity) => {
        switch (entity.type) {
          case 'bot_command':
            if (!mentioned) {
              const mention = message.text.substring(
                  entity.offset,
                  entity.offset + entity.length,
              );
              if (mention.endsWith(botName)) {
                mentioned = true;
              }
              const cmd = mention
                  .replaceAll('@' + botName, '')
                  .replaceAll(botName)
                  .trim();
              content += cmd;
              offset = entity.offset + entity.length;
            }
            break;
          case 'mention':
          case 'text_mention':
            if (!mentioned) {
              const mention = message.text.substring(
                  entity.offset,
                  entity.offset + entity.length,
              );
              if (mention === botName || mention === '@' + botName) {
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
    // 未AT機器人的消息不作處理
    if (!mentioned) {
      return new Response('NOT MENTIONED', {status: 200});
    } else {
      return null;
    }
  }
  return new Response('NOT SET BOTNAME', {status: 200}); ;
}

// 響應命令消息
async function msgHandleCommand(message) {
  return await handleCommandMessage(message);
}

// 聊天
async function msgChatWithOpenAI(message) {
  try {
    sendChatActionToTelegram('typing').then(console.log).catch(console.error);
    const historyKey = SHARE_CONTEXT.chatHistoryKey;
    const {real: history, fake: fakeHistory} = await loadHistory(historyKey);
    const answer = await sendMessageToChatGPT(message.text, fakeHistory || history);
    history.push({role: 'user', content: message.text || ''});
    history.push({role: 'assistant', content: answer});
    await DATABASE.put(historyKey, JSON.stringify(history));
    return sendMessageToTelegram(answer);
  } catch (e) {
    return sendMessageToTelegram(`ERROR:CHAT: ${e.message}`);
  }
}

// 根據類型對消息進一步處理
export async function processMessageByChatType(message) {
  const handlerMap = {
    'private': [
      msgFilterWhiteList,
      msgFilterNonTextMessage,
      msgHandleCommand,
    ],
    'group': [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
    ],
    'supergroup': [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
    ],
  };
  if (!handlerMap.hasOwnProperty(SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegram(
        `暫不支持該類型(${SHARE_CONTEXT.chatType})的聊天`,
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
          `處理(${SHARE_CONTEXT.chatType})的聊天消息出錯`,
      );
    }
  }
  return null;
}

// { real: [], fake: [] }
async function loadHistory(key) {
  const initMessage = {role: 'system', content: USER_CONFIG.SYSTEM_INIT_MESSAGE};
  let history = [];
  try {
    history = await DATABASE.get(key).then((res) => JSON.parse(res));
  } catch (e) {
    console.error(e);
  }
  if (!history || !Array.isArray(history) || history.length === 0) {
    history = [];
  }
  if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
    // 歷史記錄超出長度需要裁剪
    if (history.length > ENV.MAX_HISTORY_LENGTH) {
      history = history.splice(history.length - ENV.MAX_HISTORY_LENGTH);
    }
    // 處理token長度問題
    let tokenLength = Array.from(initMessage.content).length;
    for (let i = history.length - 1; i >= 0; i--) {
      const historyItem = history[i];
      let length = 0;
      if (historyItem.content) {
        length = Array.from(historyItem.content).length;
      } else {
        historyItem.content = '';
      }
      // 如果最大長度超過maxToken,裁剪history
      tokenLength += length;
      if (tokenLength > MAX_TOKEN_LENGTH) {
        history = history.splice(i + 1);
        break;
      }
    }
  }
  switch (history.length > 0 ? history[0].role : '') {
    case 'assistant': // 第一條為機器人，替換成init
    case 'system': // 第一條為system，用新的init替換
      history[0] = initMessage;
      break;
    default:// 默認給第一條插入init
      history.unshift(initMessage);
  }
  return {real: history};
}

export async function handleMessage(request) {
  const {message} = await request.json();

  // 消息處理中間件
  const handlers = [
    msgInitTelegramToken, // 初始化token
    msgInitChatContext, // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群組消息), SHARE_CONTEXT
    msgSaveLastMessage, // 保存最後一條消息
    msgCheckEnvIsReady, // 檢查環境是否準備好: API_KEY, DATABASE
    processMessageByChatType, // 根據類型對消息進一步處理
    msgChatWithOpenAI, // 與OpenAI聊天
  ];

  for (const handler of handlers) {
    try {
      const result = await handler(message, request);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      return new Response(errorToString(e), {status: 200});
    }
  }
  return null;
}
