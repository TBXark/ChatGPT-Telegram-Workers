import {
  deleteMessageFromTelegramWithContext,
  sendChatActionToTelegramWithContext,
  sendMessageToTelegramWithContext,
} from './telegram.js';
import {DATABASE, ENV} from './env.js';
// eslint-disable-next-line no-unused-vars
import {Context} from './context.js';
import {
  isAzureEnable,
  isOpenAIEnable,
  requestCompletionsFromAzureOpenAI,
  requestCompletionsFromOpenAI,
  requestImageFromOpenAI,
} from './openai.js';
import {tokensCounter, delay} from './utils.js';
import {isWorkersAIEnable, requestCompletionsFromWorkersAI, requestImageFromWorkersAI} from './workersai.js';
import {isGeminiAIEnable, requestCompletionsFromGeminiAI} from './gemini.js';
import {isMistralAIEnable, requestCompletionsFromMistralAI} from './mistralai.js';


/**
 * 加载历史TG消息
 *
 * @param {string} key
 * @param {Context} context
 * @return {Promise<Object>}
 */
async function loadHistory(key, context) {
  const initMessage = {role: 'system', content: context.USER_CONFIG.SYSTEM_INIT_MESSAGE};
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;

  // 判断是否禁用历史记录
  if (historyDisable) {
    initMessage.role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
    return {real: [initMessage], original: [initMessage]};
  }

  // 加载历史记录
  let history = [];
  try {
    history = JSON.parse((await DATABASE.get(key)) || '{}');
  } catch (e) {
    console.error(e);
  }
  if (!history || !Array.isArray(history)) {
    history = [];
  }


  let original = JSON.parse(JSON.stringify(history));

  // 按身份过滤
  if (context.SHARE_CONTEXT.role) {
    history = history.filter((chat) => context.SHARE_CONTEXT.role === chat.cosplay);
  }

  history.forEach((item) => {
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
    const initLength = counter(initMessage.content);
    const roleCount = Math.max(Object.keys(context.USER_DEFINE.ROLE).length, 1);
    history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    original = trimHistory(original, initLength, ENV.MAX_HISTORY_LENGTH * roleCount, ENV.MAX_TOKEN_LENGTH * roleCount);
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


/**
 *
 * @param {Context} context
 * @return {function}
 */
export function loadChatLLM(context) {
  switch (context.USER_CONFIG.AI_PROVIDER) {
    case 'openai':
      return requestCompletionsFromOpenAI;
    case 'azure':
      return requestCompletionsFromAzureOpenAI;
    case 'workers':
      return requestCompletionsFromWorkersAI;
    case 'gemini':
      return requestCompletionsFromGeminiAI;
    case 'mistral':
      return requestCompletionsFromMistralAI;
    default:
      if (isAzureEnable(context)) {
        return requestCompletionsFromAzureOpenAI;
      }
      if (isOpenAIEnable(context)) {
        return requestCompletionsFromOpenAI;
      }
      if (isWorkersAIEnable(context)) {
        return requestCompletionsFromWorkersAI;
      }
      if (isGeminiAIEnable(context)) {
        return requestCompletionsFromGeminiAI;
      }
      if (isMistralAIEnable(context)) {
        return requestCompletionsFromMistralAI;
      }
      return null;
  }
}

/**
 *
 * @param {Context} context
 * @return {function}
 */
export function loadImageGen(context) {
  switch (context.USER_CONFIG.AI_PROVIDER) {
    case 'openai':
      return requestImageFromOpenAI;
    case 'azure':
      return requestImageFromOpenAI;
    case 'workers':
      return requestImageFromWorkersAI;
    default:
      if (isOpenAIEnable(context) || isAzureEnable(context)) {
        return requestImageFromOpenAI;
      }
      if (isWorkersAIEnable(context)) {
        return requestImageFromWorkersAI;
      }
      return null;
  }
}

/**
 *
 * @param {string} text
 * @param {Context} context
 * @param {function} llm
 * @param {function} modifier
 * @param {function} onStream
 * @return {Promise<string>}
 */
async function requestCompletionsFromLLM(text, context, llm, modifier, onStream) {
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
  let history = await loadHistory(historyKey, context);
  if (modifier) {
    const modifierData = modifier(history, text);
    history = modifierData.history;
    text = modifierData.text;
  }
  const { real: realHistory, original: originalHistory } = history;

  if (ENV.ENABLE_SHOWTOKENINFO) {
    const counter = await tokensCounter();
    const inputText = [...(realHistory || []), { role: 'user', content: text }]
      .map(msg => `role: ${msg.role}, content: ${msg.content}`)
      .join("")
    context.CURRENT_CHAT_CONTEXT.promptToken = counter(inputText);
  }
  
  const answer = await llm(text, realHistory, context, onStream);
  if (!historyDisable) {
    originalHistory.push({role: 'user', content: text || '', cosplay: context.SHARE_CONTEXT.role || ''});
    originalHistory.push({role: 'assistant', content: answer, cosplay: context.SHARE_CONTEXT.role || ''});
    await DATABASE.put(historyKey, JSON.stringify(originalHistory)).catch(console.error);
  }
  return answer;
}

/**
 * 与LLM聊天
 *
 * @param {string} text
 * @param {Context} context
 * @param {function} modifier
 * @return {Promise<Response>}
 */
export async function chatWithLLM(text, context, modifier) {
  const sendFinalMsg = async (msg) => {
    const finalResponse = await sendMessageToTelegramWithContext(context)(msg);
    if (finalResponse.status === 429) {
      let retryTime = 1000 * (finalResponse.headers.get('Retry-After') ?? 10); 
      const msgIntervalId = setInterval(() => {
        console.log(`[RETRY] Still wait ${retryTime / 1000}s for final msg`);
        retryTime -= 3000;
        if (retryTime <= 0) {
          clearInterval(msgIntervalId);
        }
      }, 3000);
      await delay(retryTime);
      const secondResponse = await sendMessageToTelegramWithContext(context)(msg);
      if (secondResponse.status !== 200) {
        console.log(`[FAILED] Final msg: ${await secondResponse.text()}`);
      } else {
        console.log(`[DONE] Final msg`);
      }
      return secondResponse;
    } else {
      console.log(`[DONE] Final msg`);
      return finalResponse;
    }
  }
  try {
    if (!context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO) {
      context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO = {}
    }
    context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.TEMP_INFO = '';
    if (context.CURRENT_CHAT_CONTEXT.reply_markup) {
      delete context.CURRENT_CHAT_CONTEXT.reply_markup;
    }
    let extraInfo = '';
    const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
    try {
      if (ENV.ENABLE_SHOWINFO) {
        context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.TEMP_INFO = context.USER_CONFIG.CUSTOM_TINFO;
      }
      if (!context.CURRENT_CHAT_CONTEXT.message_id) {
        const msg = await sendMessageToTelegramWithContext(context)(
          ENV.I18N.message.loading
        ).then(r => r.json())
        context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id
        context.CURRENT_CHAT_CONTEXT.reply_markup = null
      }
      
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
    let onStream = null;
    const generateInfo = async (text) => {
      const time = ((performance.now() - llmStart) / 1000).toFixed(2);
      extraInfo = `\ntime: ${time}s`;
      if (ENV.ENABLE_SHOWTOKENINFO) {
        const unit = ENV.GPT3_TOKENS_COUNT ? 'token' : 'chars';
        const counter = await tokensCounter();
        extraInfo += `\nprompt: ${context.CURRENT_CHAT_CONTEXT.promptToken}｜complete: ${counter(text)}${unit}`;
      }
      if (context.CURRENT_CHAT_CONTEXT?.MIDDLE_INFO?.FILE_URL) {
        context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.TEMP_INFO = `🤖 ${context.USER_CONFIG.OPENAI_VISION_MODEL}` + extraInfo;
      } else {
        context.CURRENT_CHAT_CONTEXT.MIDDLE_INFO.TEMP_INFO = context.USER_CONFIG.CUSTOM_TINFO + extraInfo;
      }
      return null;
    }
    if (ENV.STREAM_MODE) {
      // context.CURRENT_CHAT_CONTEXT.parse_mode = null;
      onStream = async (text) => {
        try {
          await generateInfo(text);
          const resp = await sendMessageToTelegramWithContext(context)(text);

          if (!context.CURRENT_CHAT_CONTEXT.message_id && resp.ok) {
            context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json()).result.message_id;
          }
          return resp;
        } catch (e) {
          console.error(e);
        }
      };
    }
    
    if (context.CURRENT_CHAT_CONTEXT?.MIDDLE_INFO?.FILE_URL){
    onStream =null;
    } 
    const llm = loadChatLLM(context);
    if (llm === null) {
      return sendMessageToTelegramWithContext(context)(`LLM is not enable`);
    }
    console.log(`[START] Chat with LLM`);
    const llmStart = performance.now();
    const answer = await requestCompletionsFromLLM(text, context, llm, modifier, onStream);
    console.log(`[DONE] Chat with LLM: ${((performance.now()- llmStart)/1000).toFixed(2)}s`);
    if (extraInfo === '') {
      await generateInfo(answer);
    }
    context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
    if (ENV.SHOW_REPLY_BUTTON && context.CURRENT_CHAT_CONTEXT.message_id) {
      try {
        await deleteMessageFromTelegramWithContext(context)(context.CURRENT_CHAT_CONTEXT.message_id);
        context.CURRENT_CHAT_CONTEXT.message_id = null;
        context.CURRENT_CHAT_CONTEXT.reply_markup={
          keyboard: [[{text: '/new'}, {text: '/redo'}]],
          selective: true,
          resize_keyboard: true,
          one_time_keyboard: true,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return sendFinalMsg(answer);

  } catch (e) {
    let errMsg = `Error: ${e.message}`;
    if (errMsg.length > 2048) { // 裁剪错误信息 最长2048
      errMsg = errMsg.substring(0, 2048);
    }
    context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
    return sendFinalMsg(errMsg);
  }
}
