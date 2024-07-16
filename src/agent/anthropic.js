/* eslint-disable no-unused-vars */
import {Context} from '../config/context.js';
import {anthropicSseJsonParser, Stream} from "./stream.js";
import {ENV} from "../config/env.js";
import {requestChatCompletions} from "./request.js";


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isAnthropicAIEnable(context) {
    return !!(context.USER_CONFIG.ANTHROPIC_API_KEY && context.USER_CONFIG.ANTHROPIC_API_BASE && context.USER_CONFIG.ANTHROPIC_CHAT_MODEL);
}


/**
 * 发送消息到Anthropic AI
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromAnthropicAI(message, history, context, onStream) {
    const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
    const header = {
        'x-api-key': context.USER_CONFIG.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        'content-type': 'application/json',
    };
    // find and delete the system message
    let system = null;
    for (const msg in history) {
        if (msg.role === 'system') {
            system = msg.content;
            break;
        }
    }
    history = history.filter(msg => msg.role !== 'system');
    const body = {
        system,
        model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
        messages: [...(history || []), {role: 'user', content: message}],
        stream: onStream != null,
        max_tokens: ENV.MAX_TOKEN_LENGTH,
    };
    if (!body.system) {
        delete body.system
    }

    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {}
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, null, anthropicSseJsonParser);
    }
    options.contentExtractor = function (data) {
        return data?.delta?.text;
    }
    options.fullContentExtractor = function (data) {
        return data?.content?.[0].text;
    }
    options.errorExtractor = function (data) {
        return data?.error?.message;
    }
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

