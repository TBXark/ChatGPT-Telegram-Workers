import "../types/context.js";

/**
 * @param {ContextType} context
 * @return {boolean}
 */
export function isGeminiAIEnable(context) {
    return !!(context.USER_CONFIG.GOOGLE_API_KEY);
}

/**
 * 发送消息到Gemini
 *
 * @param {string} message
 * @param {string} prompt
 * @param {Array} history
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromGeminiAI(message, prompt, history, context, onStream) {
    onStream = null; // 暂时不支持stream模式
    const url = `${context.USER_CONFIG.GOOGLE_COMPLETIONS_API}${context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL}:${
        onStream ? 'streamGenerateContent' : 'generateContent'
    }?key=${context.USER_CONFIG.GOOGLE_API_KEY}`;

    const contentsTemp = [...history || [], {role: 'user', content: message}];
    if (prompt) {
        contentsTemp.push({role: 'assistant', content: prompt});
    }
    const contents = [];
    const rolMap = {
        'assistant': 'model',
        'system': 'user',
        'user': 'user',
    };
    // role必须是 model,user 而且不能连续两个一样
    for (const msg of contentsTemp) {
        msg.role = rolMap[msg.role];
        // 如果存在最后一个元素或role不一样则插入
        if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
            contents.push({
                'role': msg.role,
                'parts': [
                    {
                        'text': msg.content,
                    },
                ],
            });
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
