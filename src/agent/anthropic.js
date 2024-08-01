import "../types/context.js";
import "../types/agent.js";
import {anthropicSseJsonParser, Stream} from "./stream.js";
import {ENV} from "../config/env.js";
import {requestChatCompletions} from "./request.js";


/**
 * @param {ContextType} context
 * @return {boolean}
 */
export function isAnthropicAIEnable(context) {
    return !!(context.USER_CONFIG.ANTHROPIC_API_KEY);
}

/**
 * @param {HistoryItem} item
 * @return {Object}
 */
function renderAnthropicMessage(item) {
    return {
        role: item.role,
        content: item.content,
    };
}


/**
 * 发送消息到Anthropic AI
 *
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromAnthropicAI(params, context, onStream) {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
    const header = {
        'x-api-key': context.USER_CONFIG.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        'content-type': 'application/json',
    };

    const messages = ([...(history || []), {role: 'user', content: message}]).map(renderAnthropicMessage);
    const body = {
        system: prompt,
        model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
        messages: messages,
        stream: onStream != null,
        max_tokens: ENV.MAX_TOKEN_LENGTH,
    };
    if (!body.system) {
        delete body.system;
    }
    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {};
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, null, anthropicSseJsonParser);
    };
    options.contentExtractor = function (data) {
        return data?.delta?.text;
    };
    options.fullContentExtractor = function (data) {
        return data?.content?.[0].text;
    };
    options.errorExtractor = function (data) {
        return data?.error?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

