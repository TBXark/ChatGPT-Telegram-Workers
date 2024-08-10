import '../types/context.js';

/**
 * @param {ContextType} context
 * @returns {boolean}
 */
export function isGeminiAIEnable(context) {
  return !!(context.USER_CONFIG.GOOGLE_API_KEY);
}


const GEMINI_ROLE_MAP = {
  'assistant': 'model',
  'system': 'user',
  'user': 'user',
};

/**
 * @param {HistoryItem} item
 * @returns {object}
 */
function renderGeminiMessage(item) {
  return {
    role: GEMINI_ROLE_MAP[item.role],
    parts: [
      {
        'text': item.content || '',
      },
    ],
  };
}

/**
 * 发送消息到Gemini
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {Function} onStream
 * @returns {Promise<string>}
 */
export async function requestCompletionsFromGeminiAI(params, context, onStream) {
  const {message, prompt, history} = params;
  onStream = null; // 暂时不支持stream模式
  const url = `${context.USER_CONFIG.GOOGLE_COMPLETIONS_API}${context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL}:${
    onStream ? 'streamGenerateContent' : 'generateContent'
  }?key=${context.USER_CONFIG.GOOGLE_API_KEY}`;

  const contentsTemp = [...history || [], {role: 'user', content: message}];
  if (prompt) {
    contentsTemp.unshift({role: 'assistant', content: prompt});
  }
  const contents = [];
  // role必须是 model,user 而且不能连续两个一样
  for (const msg of contentsTemp) {
    msg.role = GEMINI_ROLE_MAP[msg.role];
    // 如果存在最后一个元素或role不一样则插入
    if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
      contents.push(renderGeminiMessage(msg));
    } else {
      // 否则合并
      contents[contents.length - 1].parts[0].text += msg.content;
    }
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({contents}),
  });
  const data = await resp.json();
  try {
    return data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.error(e);
    if (!data) {
      throw new Error('Empty response');
    }
    throw new Error(data?.error?.message || JSON.stringify(data));
  }
}
