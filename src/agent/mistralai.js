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
 * 发送消息到Mistral AI
 *
 * @param {string} message
 * @param {string} prompt
 * @param {Array} history
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromMistralAI(message, prompt, history, context, onStream) {
    const url = `${context.USER_CONFIG.MISTRAL_API_BASE}/chat/completions`;
    const messages = [...(history || []), {role: 'user', content: message}];
    if (prompt) {
        messages.push({role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt});
    }
    const body = {
        model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
        messages,
        stream: onStream != null,
    };
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`,
    };
    return requestChatCompletions(url, header, body, context, onStream);
}
