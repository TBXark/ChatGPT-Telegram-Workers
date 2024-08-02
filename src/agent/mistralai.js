import "../types/context.js";
import {requestChatCompletions} from "./request.js";

/**
 * @param {ContextType} context
 * @return {boolean}
 */
export function isMistralAIEnable(context) {
    return !!(context.USER_CONFIG.MISTRAL_API_KEY);
}

/**
 * @param {HistoryItem} item
 * @return {Object}
 */
function renderMistralMessage(item) {
    return {
        role: item.role,
        content: item.content,
    };
}


/**
 * 发送消息到Mistral AI
 *
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromMistralAI(params, context, onStream) {
    const {message, prompt, history} = params;
    const url = `${context.USER_CONFIG.MISTRAL_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`,
    };

    const messages = [...(history || []), {role: 'user', content: message}];
    if (prompt) {
        messages.unshift({role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt});
    }

    const body = {
        model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
        messages: messages.map(renderMistralMessage),
        stream: onStream != null,
    };

    return requestChatCompletions(url, header, body, context, onStream);
}
