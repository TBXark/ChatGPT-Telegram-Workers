/* eslint-disable no-unused-vars */
import {Context} from '../config/context.js';

import {requestChatCompletions} from "./request.js";

/**
 * @param {Context} context
 * @return {boolean}
 */
export function isMistralAIEnable(context) {
    return !!(context.USER_CONFIG.MISTRAL_API_KEY && context.USER_CONFIG.MISTRAL_COMPLETIONS_API && context.USER_CONFIG.MISTRAL_CHAT_MODEL);
}

/**
 * 发送消息到Mistral AI
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromMistralAI(message, history, context, onStream) {
    const url = context.USER_CONFIG.MISTRAL_COMPLETIONS_API;
    const body = {
        model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: [...(history || []), {role: 'user', content: message}],
        stream: onStream != null,
    };
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`,
    };
    return requestChatCompletions(url, header, body, context, onStream);
}
