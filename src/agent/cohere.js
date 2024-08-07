import "../types/context.js";
import {cohereSseJsonParser, Stream} from "./stream.js";
import {requestChatCompletions} from "./request.js";


/**
 * @param {ContextType} context
 * @returns {boolean}
 */
export function isCohereAIEnable(context) {
    return !!(context.USER_CONFIG.COHERE_API_KEY);
}

const COHERE_ROLE_MAP = {
    'assistant': 'CHATBOT',
    'user': 'USER',
};

/**
 * @param {HistoryItem} item
 * @returns {object}
 */
function renderCohereMessage(item) {
    return {
        role: COHERE_ROLE_MAP[item.role],
        content: item.content,
    };
}


/**
 * 发送消息到Cohere AI
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {Function} onStream
 * @returns {Promise<string>}
 */
export async function requestCompletionsFromCohereAI(params, context, onStream) {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
    const header = {
        'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
    };

    const body = {
        message,
        model: context.USER_CONFIG.COHERE_CHAT_MODEL,
        stream: onStream != null,
        preamble: prompt,
        chat_history: history.map(renderCohereMessage),
    };
    if (!body.preamble) {
        delete body.preamble;
    }

    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {};
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, null, cohereSseJsonParser);
    };
    options.contentExtractor = function (data) {
        return data?.text;
    };
    options.fullContentExtractor = function (data) {
        return data?.text;
    };
    options.errorExtractor = function (data) {
        return data?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}
