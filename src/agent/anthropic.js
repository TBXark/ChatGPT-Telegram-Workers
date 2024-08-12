import '../types/context.js';
import '../types/agent.js';
import {anthropicSseJsonParser, Stream} from './stream.js';
import {requestChatCompletions} from './request.js';
import {imageToBase64String} from '../utils/image.js';


/**
 * @param {ContextType} context
 * @returns {boolean}
 */
export function isAnthropicAIEnable(context) {
    return !!(context.USER_CONFIG.ANTHROPIC_API_KEY);
}

/**
 * @param {HistoryItem} item
 * @returns {Promise<object>}
 */
async function renderAnthropicMessage(item) {
    const res = {
        role: item.role,
        content: item.content,
    };

    if (item.images && item.images.length > 0) {
        res.content = [];
        if (item.content) {
            res.content.push({type: 'text', text: item.content});
        }
        for (const image of item.images) {
            res.content.push(await imageToBase64String(image).then(({format, data}) => {
                return {type: 'image', source: {type: 'base64', media_type: format, data}};
            }));
        }
    }
    return res;
}


/**
 * 发送消息到Anthropic AI
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {Function} onStream
 * @returns {Promise<string>}
 */
export async function requestCompletionsFromAnthropicAI(params, context, onStream) {
    const {message, images, prompt, history} = params;
    const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
    const header = {
        'x-api-key': context.USER_CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    };

    const messages = ([...(history || []), {role: 'user', content: message, images}]);

    const body = {
        system: prompt,
        model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
        messages: await Promise.all(messages.map(renderAnthropicMessage)),
        stream: onStream != null,
    };
    if (!body.system) {
        delete body.system;
    }
    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {};
    options.streamBuilder = function(r, c) {
        return new Stream(r, c, null, anthropicSseJsonParser);
    };
    options.contentExtractor = function(data) {
        return data?.delta?.text;
    };
    options.fullContentExtractor = function(data) {
        return data?.content?.[0].text;
    };
    options.errorExtractor = function(data) {
        return data?.error?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

