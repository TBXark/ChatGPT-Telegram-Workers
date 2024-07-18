import "../types/context.js"
import {cohereSseJsonParser, JSONLDecoder, Stream} from "./stream.js";
import {requestChatCompletions} from "./request.js";


/**
 * @param {ContextType} context
 * @return {boolean}
 */
export function isCohereAIEnable(context) {
    return !!(context.USER_CONFIG.COHERE_API_KEY);
}


/**
 * 发送消息到Cohere AI
 *
 * @param {string} message
 * @param {string} prompt
 * @param {Array} history
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromCohereAI(message, prompt, history, context, onStream) {
    const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
    const header = {
        'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const roleMap = {
        'assistant': 'CHATBOT',
        'user': 'USER',
    }

    const body = {
        message,
        model: context.USER_CONFIG.COHERE_CHAT_MODEL,
        stream: onStream != null,
        preamble: prompt,
        chat_history: history.map((msg) => {
            return {
                role: roleMap[msg.role],
                message: msg.content,
            }
        }),
    };
    if (!body.preamble) {
        delete body.preamble
    }
    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {}
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, new JSONLDecoder(), cohereSseJsonParser);
    }
    options.contentExtractor = function (data) {
        if (data?.event_type === 'text-generation') {
            return data?.text;
        }
        return null
    }
    options.fullContentExtractor = function (data) {
        return data?.text;
    }
    options.errorExtractor = function (data) {
        return data?.message;
    }
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}
