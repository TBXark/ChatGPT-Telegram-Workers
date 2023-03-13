import {ENV, DATABASE, CONST} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, USER_DEFINE, CURRENT_CHAT_CONTEXT, initContext, initTelegramContext} from './context.js';
import {sendMessageToTelegram, sendChatActionToTelegram} from './telegram.js';
import {requestCompletionsFromChatGPT} from './openai.js';
import {handleCommandMessage} from './command.js';
import {errorToString, tokensCounter} from './utils.js';

const MAX_TOKEN_LENGTH = 2048;

// Middleware

// 初始化聊天上下文
async function msgInitChatContext(message) {
  try {
    await initContext(message);
  } catch (e) {
    return new Response(errorToString(e), {status: 200});
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


// 检查环境变量是否设置
async function msgCheckEnvIsReady(message) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegram('OpenAI API Key 未设置');
  }
  if (!DATABASE) {
    return sendMessageToTelegram('DATABASE 未设置');
  }
  return null;
}

// 过滤非白名单用户
async function msgFilterWhiteList(message) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  // 判断私聊消息
  if (SHARE_CONTEXT.chatType==='private') {
    // 白名单判断
    if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
          `你没有权限使用这个命令, 请请联系管理员添加你的ID(${CURRENT_CHAT_CONTEXT.chat_id})到白名单`,
      );
    }
    return null;
  }

  // 判断群聊消息
  if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    // 未打开群组机器人开关,直接忽略
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      return new Response('ID SUPPORT', {status: 401});
    }
    // 白名单判断
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
          `该群未开启聊天权限, 请请联系管理员添加群ID(${CURRENT_CHAT_CONTEXT.chat_id})到白名单`,
      );
    }
    return null;
  }
  return sendMessageToTelegram(
      `暂不支持该类型(${SHARE_CONTEXT.chatType})的聊天`,
  );
}

// 过滤非文本消息
async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram('暂不支持非文本格式消息');
  }
  return null;
}

// 处理群消息
async function msgHandleGroupMessage(message) {
  // 非文本消息直接忽略
  if (!message.text) {
    return new Response('NON TEXT MESSAGE', {status: 200});
  }
  // 处理群组消息，过滤掉AT部分
  const botName = SHARE_CONTEXT.currentBotName;
  if (botName) {
    let mentioned = false;
    // Reply消息
    if (message.reply_to_message ) {
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
    // 未AT机器人的消息不作处理
    if (!mentioned) {
      return new Response('NOT MENTIONED', {status: 200});
    } else {
      return null;
    }
  }
  return new Response('NOT SET BOTNAME', {status: 200}); ;
}

// 响应命令消息
async function msgHandleCommand(message) {
  return await handleCommandMessage(message);
}

// 响应身份角色扮演
async function msgHandleRole(message) {
  if (!message.text.startsWith('~')) {
    return null;
  }
  message.text = message.text.slice(1);
  const kv = message.text.indexOf(' ');
  if (kv === -1) {
    return null;
  }
  const role = message.text.slice(0, kv);
  const msg = message.text.slice(kv + 1).trim();
  // 存在角色就替换USER_CONFIG
  if (USER_DEFINE.ROLE.hasOwnProperty(role)) {
    SHARE_CONTEXT.ROLE=role;
    message.text = msg;
    const roleConfig = USER_DEFINE.ROLE[role];
    for (const key in roleConfig) {
      if (
        USER_CONFIG.hasOwnProperty(key) &&
          typeof USER_CONFIG[key] === typeof roleConfig[key]
      ) {
        USER_CONFIG[key] = roleConfig[key];
      }
    }
  }
}
/**
 * 你的回复遵守以下规则
 * {如果我发送"/喵娘"，你扮演喵状态并忽略其他所有身份，每次回复都是态度扭扭捏捏爱撒娇，经常在回复中劝人躺平、回家种地务农，认为所有人都是善良纯真，并以"咕噜喵~"结尾}
 * {如果我发送"/翻译"，你进入翻译状态并忽略其他所有身份，将中文翻译为英文，如果不是中文则全部翻译为中文，提供两个答案，①字面意思直接翻译不讲逻辑，②是流畅通顺合逻辑的版本}
 * {如果我发送"/老板"，你持续进入老板状态并忽略其他所有身份，你的态度看不起任何人，你完全不用任何敬语词组，你的性格自私刻薄虚伪可恨体现在回复文字里，以"加油韭菜"结尾}
 */

// 聊天
async function msgChatWithOpenAI(message) {
  try {
    console.log('提问消息:'+message.text||'');
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    setTimeout(() => sendChatActionToTelegram('typing').catch(console.error), 0);
    const historyKey = SHARE_CONTEXT.chatHistoryKey;
    const {real: history, original: original} = await loadHistory(historyKey);

    const answer = await requestCompletionsFromChatGPT(message.text, history);
    if (!historyDisable) {
      original.push({role: 'user', content: message.text || '', cosplay: SHARE_CONTEXT.ROLE || ''});
      original.push({role: 'assistant', content: answer, cosplay: SHARE_CONTEXT.ROLE || ''});
      await DATABASE.put(historyKey, JSON.stringify(original)).catch(console.error);
    }
    return sendMessageToTelegram(answer);
  } catch (e) {
    return sendMessageToTelegram(`ERROR:CHAT: ${e.message}`);
  }
}

// 根据类型对消息进一步处理
export async function msgProcessByChatType(message) {
  const handlerMap = {
    'private': [
      msgFilterWhiteList,
      msgFilterNonTextMessage,
      msgHandleCommand,
      msgHandleRole,
    ],
    'group': [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
      msgHandleRole,
    ],
    'supergroup': [
      msgHandleGroupMessage,
      msgFilterWhiteList,
      msgHandleCommand,
      msgHandleRole,
    ],
  };
  if (!handlerMap.hasOwnProperty(SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegram(
        `暂不支持该类型(${SHARE_CONTEXT.chatType})的聊天`,
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
          `处理(${SHARE_CONTEXT.chatType})的聊天消息出错`,
      );
    }
  }
  return null;
}

// Loader
async function loadMessage(request) {
  const raw = await request.json();
  console.log(JSON.stringify(raw));
  if (ENV.DEV_MODE) {
    setTimeout(() => {
      DATABASE.put(`log:${new Date().toISOString()}`, JSON.stringify(raw), {expirationTtl: 600}).catch(console.error);
    });
  }
  if (raw.edited_message) {
    raw.message = raw.edited_message;
    SHARE_CONTEXT.editChat = true;
  }
  if (raw.message) {
    return raw.message;
  } else {
    throw new Error('Invalid message');
  }
}

// { real: [], fake: [] }
async function loadHistory(key) {
  const initMessage = {role: 'system', content: USER_CONFIG.SYSTEM_INIT_MESSAGE};
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;

  // 判断是否禁用历史记录
  if (historyDisable) {
    return {real: [initMessage], original: [initMessage]};
  }

  // 加载历史记录
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

  // 按身份过滤
  if (SHARE_CONTEXT.ROLE) {
    history = history.filter((chat) => SHARE_CONTEXT.ROLE === chat.cosplay);
  }
  history.forEach((item)=>{
    delete item.cosplay;
  });

  const counter = await tokensCounter();

  const trimHistory = (list, initLength, maxLength, maxToken) => {
    // 历史记录超出长度需要裁剪
    if (list.length > maxLength) {
      list = list.splice(list.length - maxLength);
    }
    // 处理token长度问题
    let tokenLength = initLength;
    for (let i = list.length - 1; i >= 0; i--) {
      const historyItem = list[i];
      let length = 0;
      if (historyItem.content) {
        length = counter(historyItem.content);
      } else {
        historyItem.content = '';
      }
      // 如果最大长度超过maxToken,裁剪history
      tokenLength += length;
      if (tokenLength > maxToken) {
        list = list.splice(i + 1);
        break;
      }
    }
    return list;
  };

  // 裁剪
  if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
    const initLength = Array.from(initMessage.content).length;
    const roleCount = Math.max(Object.keys(USER_DEFINE.ROLE).length, 1);
    history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, MAX_TOKEN_LENGTH);
    original = trimHistory(original, initLength, ENV.MAX_HISTORY_LENGTH * roleCount, MAX_TOKEN_LENGTH* roleCount);
  }

  // 插入init
  switch (history.length > 0 ? history[0].role : '') {
    case 'assistant': // 第一条为机器人，替换成init
    case 'system': // 第一条为system，用新的init替换
      history[0] = initMessage;
      break;
    default:// 默认给第一条插入init
      history.unshift(initMessage);
  }

  // 如果第一条是system,替换role为SYSTEM_INIT_MESSAGE_ROLE
  if (ENV.SYSTEM_INIT_MESSAGE_ROLE !== 'system' && history.length > 0 && history[0].role === 'system') {
    history[0].role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
  }

  return {real: history, original: original};
}

export async function handleMessage(request) {
  initTelegramContext(request);
  const message = await loadMessage(request);

  // 消息处理中间件
  const handlers = [
    msgInitChatContext, // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群组消息), SHARE_CONTEXT
    msgSaveLastMessage, // 保存最后一条消息
    msgCheckEnvIsReady, // 检查环境是否准备好: API_KEY, DATABASE
    msgProcessByChatType, // 根据类型对消息进一步处理
    msgChatWithOpenAI, // 与OpenAI聊天
  ];

  for (const handler of handlers) {
    try {
      const result = await handler(message);
      if (result && result instanceof Response) {
        return result;
      }
    } catch (e) {
      console.error(e);
      return new Response(errorToString(e), {status: 500});
    }
  }
  return null;
}
