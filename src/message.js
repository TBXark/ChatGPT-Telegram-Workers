import {ENV, DATABASE} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, CURRENR_CHAT_CONTEXT, initUserConfig} from './context.js';
import {sendMessageToTelegram, sendChatActionToTelegram} from './telegram.js';
import {sendMessageToChatGPT} from './openai.js';
import {handleCommandMessage} from './command.js';

// 初始化当前Telegram Token
async function msgInitTelegramToken(message, request) {
  const {pathname} = new URL(request.url);
  const token = pathname.match(
      /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/,
  )[1];
  if (ENV.TELEGRAM_TOKEN && ENV.TELEGRAM_TOKEN === token) {
    return null;
  }
  if (ENV.TELEGRAM_AVAILABLE_TOKENS.includes(token)) {
    ENV.TELEGRAM_TOKEN = token;
    return null;
  }
  if (ENV.TELEGRAM_AVAILABLE_TOKENS.length > 0) {
    // 如果有多个BOT，需要设置currentBotId
    SHARE_CONTEXT.currentBotId = token.split(':')[0];
  }
  if (message?.chat?.id) {
    return sendMessageToTelegram(
        '你没有权限使用这个命令, 请请联系管理员添加你的Token到白名单',
        token,
        {chat_id: message.chat.id},
    );
  } else {
    return new Response(
        '你没有权限使用这个命令, 请请联系管理员添加你的Token到白名单',
        {status: 200},
    );
  }
}


async function msgSaveLastMessage(message) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message));
  }
  return null;
}


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
    if (!ENV.GROUP_CHAT_BOT_MODE && message.from.id) {
      historyKey += `:${message.from.id}`;
    }
    SHARE_CONTEXT.groupAdminKey = `group_admin:${id}`;
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
  // 对群组消息放行
  if (CURRENR_CHAT_CONTEXT.reply_to_message_id) {
    return null;
  }
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENR_CHAT_CONTEXT.chat_id}`)) {
    return sendMessageToTelegram(
        `你没有权限使用这个命令, 请请联系管理员添加你的ID(${CURRENR_CHAT_CONTEXT.chat_id})到白名单`,
    );
  }
  return null;
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
  // 处理群组消息，过滤掉AT部分
  if (ENV.BOT_NAME && CURRENR_CHAT_CONTEXT.reply_to_message_id) {
    if (!message.text) {
      return new Response('NON TEXT MESSAGE', {status: 200});
    }
    let mentioned = false;
    // Reply消息
    if (message.reply_to_message) {
      if (message.reply_to_message.from.username === ENV.BOT_NAME) {
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
              if (mention.endsWith(ENV.BOT_NAME)) {
                mentioned = true;
              }
              const cmd = mention
                  .replaceAll('@' + ENV.BOT_NAME, '')
                  .replaceAll(ENV.BOT_NAME)
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
              if (mention === ENV.BOT_NAME || mention === '@' + ENV.BOT_NAME) {
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
  return await handleCommandMessage(message);
}

// 聊天
async function msgChatWithOpenAI(message) {
  try {
    try {
      await sendChatActionToTelegram();
    } catch (e) {
      console.log(e);
    }
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
    // 历史记录超出长度需要裁剪
    if (history.length > ENV.MAX_HISTORY_LENGTH) {
      history.splice(history.length - ENV.MAX_HISTORY_LENGTH + 2);
    }
    // 处理token长度问题
    let tokenLength = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const historyItem = history[i];
      const length = Array.from(historyItem.content).length;
      // 如果最大长度超过maxToken,裁剪history
      tokenLength += length;
      if (tokenLength > MAX_TOKEN_LENGTH) {
        history.splice(i);
        break;
      }
    }
    const answer = await sendMessageToChatGPT(message.text, history);
    history.push({role: 'user', content: message.text});
    history.push({role: 'assistant', content: answer});
    await DATABASE.put(historyKey, JSON.stringify(history));
    return sendMessageToTelegram(answer, ENV.TELEGRAM_TOKEN);
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}


export async function handleMessage(request) {
  const {message} = await request.json();

  // 消息处理中间件
  const handlers = [
    msgInitTelegramToken, // 初始化token
    msgSaveLastMessage, // 保存最后一条消息
    msgInitChatContext, // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群组消息), SHARE_CONTEXT
    msgCheckEnvIsReady, // 检查环境是否准备好: API_KEY, DATABASE
    msgFilterWhiteList, // 检查白名单
    msgHandleGroupMessage, // 处理群聊消息
    msgFilterNonTextMessage, // 过滤非文本消息
    msgHandleCommand, // 处理命令
    msgChatWithOpenAI, // 与OpenAI聊天
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


const MAX_TOKEN_LENGTH = 2000;
