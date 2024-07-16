/* eslint-disable no-unused-vars */
import {Context} from '../config/context.js';
import {cohereSseJsonParser, JSONLDecoder, Stream} from "./stream.js";
import {requestChatCompletions} from "./request.js";


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isCohereAIEnable(context) {
    return !!(context.USER_CONFIG.COHERE_API_KEY && context.USER_CONFIG.COHERE_API_BASE && context.USER_CONFIG.COHERE_CHAT_MODEL);
}


/**
 * 发送消息到Cohere AI
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromCohereAI(message, history, context, onStream) {
    const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
    const header = {
        'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    const contentsTemp = [];
    let preamble = '';
    for (const msg of history) {
        switch (msg.role) {
            case 'system':
                preamble = msg.content;
                break;
            case 'assistant':
                if (msg.content) {
                    contentsTemp.push({role: 'CHATBOT', message: msg.content});
                }
                break;
            case 'user':
                if (msg.content) {
                    contentsTemp.push({role: 'USER', message: msg.content});
                }
                break;
            default:
                break;
        }
    }
    const body = {
        message,
        model: context.USER_CONFIG.COHERE_CHAT_MODEL,
        stream: onStream != null,
        preamble,
        chat_history: contentsTemp,
    };
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
