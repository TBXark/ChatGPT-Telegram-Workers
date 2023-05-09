/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {DATABASE, ENV} from './env.js';
import {tokensCounter} from './utils.js';

/**
 * 从流数据中提取内容
 * @param {string} stream
 * @return {{pending: string, content: string}}
 */
function extractContentFromStreamData(stream) {
  const line = stream.split('\n');
  let remainingStr = '';
  let contentStr = '';
  for (const l of line) {
    try {
      if (l.startsWith('data:') && l.endsWith('}')) {
        const data = JSON.parse(l.substring(5));
        contentStr += data.choices[0].delta?.content || '';
      } else {
        remainingStr = l;
      }
    } catch (e) {
      remainingStr = l;
    }
  }
  return {
    content: contentStr,
    pending: remainingStr,
  };
}

/**
 * 发送消息到ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
async function requestCompletionsFromOpenAI(message, history, context, onStream) {
  console.log(`requestCompletionsFromOpenAI: ${message}`);
  console.log(`history: ${JSON.stringify(history, null, 2)}`);
  const key = context.openAIKeyFromContext();
  const body = {
    model: ENV.CHAT_MODEL,
    ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
    messages: [...(history || []), {role: 'user', content: message}],
    stream: onStream != null,
  };
  let resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (onStream) {
    const reader = resp.body.getReader({mode: 'byob'});
    const decoder = new TextDecoder('utf-8');
    let data = {done: false};
    let pendingText = '';
    let contentFull = '';
    let lengthDelta = 0;
    while (data.done === false) {
      data = await reader.readAtLeast(4096, new Uint8Array(5000));
      pendingText += decoder.decode(data.value);
      const content = extractContentFromStreamData(pendingText);
      pendingText = content.pending;
      lengthDelta += content.content.length;
      contentFull = contentFull + content.content;
      if (lengthDelta > 20) {
        lengthDelta = 0;
        await onStream(contentFull);
      }
    }
    return contentFull;
  }

  resp = await resp.json();
  if (resp.error?.message) {
    if (ENV.DEV_MODE || ENV.DEV_MODE) {
      throw new Error(`OpenAI API Error\n> ${resp.error.message}\nBody: ${JSON.stringify(body)}`);
    } else {
      throw new Error(`OpenAI API Error\n> ${resp.error.message}`);
    }
  }
  setTimeout(() => updateBotUsage(resp.usage, context).catch(console.error), 0);
  return resp.choices[0].message.content;
}


/**
 * 请求ChatGPT生成图片
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
  console.log(`requestImageFromOpenAI: ${prompt}`);
  const key = context.openAIKeyFromContext();
  const body = {
    prompt: prompt,
    n: 1,
    size: '512x512',
  };
  const resp = await fetch(`${ENV.OPENAI_API_DOMAIN}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  if (resp.error?.message) {
    throw new Error(`OpenAI API Error\n> ${resp.error.message}`);
  }
  return resp.data[0].url;
}


/**
 * 获取账单
 * @param {Context} context
 * @return {Promise<{totalAmount,totalUsage,remaining,}>}
 */
export async function requestBill(context) {
  const apiUrl = ENV.OPENAI_API_DOMAIN;
  const key = context.openAIKeyFromContext();

  const date2Cmp = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return {
      year, month, day,
    };
  };

  const start = date2Cmp(new Date());
  const startDate = `${start.year}-${start.month}-01`;
  const end = date2Cmp(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const endDate = `${end.year}-${end.month}-${end.day}`;

  const urlSub = `${apiUrl}/v1/dashboard/billing/subscription`;
  const urlUsage = `${apiUrl}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`;
  const headers = {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
  };

  try {
    const subResp = await fetch(urlSub, {headers});
    const subscriptionData = await subResp.json();
    const totalAmount = subscriptionData.hard_limit_usd;

    const usageResp = await fetch(urlUsage, {headers});
    const usageData = await usageResp.json();
    const totalUsage = usageData.total_usage / 100;
    const remaining = totalAmount - totalUsage;

    return {
      totalAmount: totalAmount.toFixed(2),
      totalUsage: totalUsage.toFixed(2),
      remaining: remaining.toFixed(2),
    };
  } catch (error) {
    console.error(error);
  }
  return {};
}

/**
 *
 * @param {string} text
 * @param {Context} context
 * @param {function} modifier
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromChatGPT(text, context, modifier, onStream) {
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
  let history = await loadHistory(historyKey, context);
  if (modifier) {
    const modifierData = modifier(history, text);
    history = modifierData.history;
    text = modifierData.text;
  }
  const {real: realHistory, original: originalHistory} = history;
  const answer = await requestCompletionsFromOpenAI(text, realHistory, context, onStream);
  if (!historyDisable) {
    originalHistory.push({role: 'user', content: text || '', cosplay: context.SHARE_CONTEXT.role || ''});
    originalHistory.push({role: 'assistant', content: answer, cosplay: context.SHARE_CONTEXT.role || ''});
    await DATABASE.put(historyKey, JSON.stringify(originalHistory)).catch(console.error);
  }
  return answer;
}


/**
 * 更新当前机器人的用量统计
 * @param {object} usage
 * @param {Context} context
 * @return {Promise<void>}
 */
async function updateBotUsage(usage, context) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return;
  }

  let dbValue = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));

  if (!dbValue) {
    dbValue = {
      tokens: {
        total: 0,
        chats: {},
      },
    };
  }

  dbValue.tokens.total += usage.total_tokens;
  if (!dbValue.tokens.chats[context.SHARE_CONTEXT.chatId]) {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] = usage.total_tokens;
  } else {
    dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] += usage.total_tokens;
  }

  await DATABASE.put(context.SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}

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
    history = JSON.parse(await DATABASE.get(key));
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

