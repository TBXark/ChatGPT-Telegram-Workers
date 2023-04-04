import {CONST, DATABASE, ENV} from './env.js';
import {Context} from './context.js';
import {sendMessageToTelegramWithContext, sendChatActionToTelegramWithContext} from './telegram.js';
import {requestCompletionsFromChatGPT} from './openai.js';
import {handleCommandMessage} from './command.js';
import {errorToString} from './utils.js';

// import {TelegramMessage, TelegramWebhookRequest} from './type.d.ts';


/**
 * 初始化聊天上下文
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgInitChatContext(message, context) {
  try {
    await context.initContext(message);
  } catch (e) {
    return new Response(errorToString(e), {status: 200});
  }
  return null;
}


/**
 * 保存最后一条消息
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgSaveLastMessage(message, context) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
    await DATABASE.put(lastMessageKey, JSON.stringify(message), {expirationTtl: 3600});
  }
  return null;
}


/**
 * 检查环境变量是否设置
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgCheckEnvIsReady(message, context) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegramWithContext(context)('OpenAI API Key Not Set');
  }
  if (!DATABASE) {
    return sendMessageToTelegramWithContext(context)('DATABASE Not Set');
  }
  return null;
}

/**
 * 过滤非白名单用户
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgFilterWhiteList(message, context) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null;
  }
  // 判断私聊消息
  if (context.SHARE_CONTEXT.chatType==='private') {
    // 白名单判断
    if (!ENV.CHAT_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegramWithContext(context)(
          ENV.I18N.message.user_has_no_permission_to_use_the_bot(context.CURRENT_CHAT_CONTEXT.chat_id),
      );
    }
    return null;
  }

  // 判断群组消息
  if (CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
    // 未打开群组机器人开关,直接忽略
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      return new Response('Not support', {status: 401});
    }
    // 白名单判断
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegramWithContext(context)(
          ENV.I18N.message.group_has_no_permission_to_use_the_bot(context.CURRENT_CHAT_CONTEXT.chat_id),
      );
    }
    return null;
  }
  return sendMessageToTelegramWithContext(context)(
      ENV.I18N.message.not_supported_chat_type(context.SHARE_CONTEXT.chatType),
  );
}


/**
 * 过滤非文本消息
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgFilterNonTextMessage(message, context) {
  if (!message.text) {
    return sendMessageToTelegramWithContext(context)(ENV.I18N.message.not_supported_chat_type_message);
  }
  return null;
}


/**
 * 处理群消息
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgHandleGroupMessage(message, context) {
  // 非文本消息直接忽略
  if (!message.text) {
    return new Response('Non text message', {status: 200});
  }
  // 处理群组消息，过滤掉AT部分
  const botName = context.SHARE_CONTEXT.currentBotName;
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
                  .replaceAll(botName, '')
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
      return new Response('No mentioned', {status: 200});
    } else {
      return null;
    }
  }
  return new Response('Not set bot name', {status: 200});
}


/**
 * 响应命令消息
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgHandleCommand(message, context) {
  return await handleCommandMessage(message, context);
}


/**
 * 响应身份角色扮演
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgHandleRole(message, context) {
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
  if (context.USER_DEFINE.ROLE.hasOwnProperty(role)) {
    context.SHARE_CONTEXT.role=role;
    message.text = msg;
    const roleConfig = context.USER_DEFINE.ROLE[role];
    for (const key in roleConfig) {
      if (
        context.USER_CONFIG.hasOwnProperty(key) &&
          typeof context.USER_CONFIG[key] === typeof roleConfig[key]
      ) {
        context.USER_CONFIG[key] = roleConfig[key];
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


/**
 * 与OpenAI聊天
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function msgChatWithOpenAI(message, context) {
  try {
    console.log('Ask:'+message.text||'');
    setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
    const answer = await requestCompletionsFromChatGPT(message.text, context, null);
    return sendMessageToTelegramWithContext(context)(answer);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`Error: ${e.message}`);
  }
}

/**
 * 根据类型对消息进一步处理
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
export async function msgProcessByChatType(message, context) {
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
  if (!handlerMap.hasOwnProperty(context.SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegramWithContext(context)(
        ENV.I18N.message.not_supported_chat_type(context.SHARE_CONTEXT.chatType),
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
          ENV.I18N.message.handle_chat_type_message_error(context.SHARE_CONTEXT.chatType),
      );
    }
  }
  return null;
}

/**
 * 加载真实TG消息
 *
 * @param {Request} request
 * @param {Context} context
 * @return {Promise<Object>}
 */
async function loadMessage(request, context) {
  /**
 * @type {TelegramWebhookRequest}
 */
  const raw = await request.json();
  console.log(JSON.stringify(raw));
  if (ENV.DEV_MODE) {
    setTimeout(() => {
      DATABASE.put(`log:${new Date().toISOString()}`, JSON.stringify(raw), {expirationTtl: 600}).catch(console.error);
    });
  }
  if (raw.edited_message) {
    throw new Error('Ignore edited message');
  }
  if (raw.message) {
    return raw.message;
  } else {
    throw new Error('Invalid message');
  }
}

/**
 * @param {Request} request
 * @return {Promise<Response|null>}
 */
export async function handleMessage(request) {
  const context = new Context();
  context.initTelegramContext(request);
  const message = await loadMessage(request, context);

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
      const result = await handler(message, context);
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
