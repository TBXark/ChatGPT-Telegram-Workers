import '../types/context.js';
import {requestChatCompletions} from './request.js';
import {ENV} from '../config/env.js';

import {imageToBase64String, renderBase64DataURI} from '../utils/image.js';


/**
 * @param {ContextType} context
 * @returns {string|null}
 */
function openAIKeyFromContext(context) {
    const length = context.USER_CONFIG.OPENAI_API_KEY.length;
    return context.USER_CONFIG.OPENAI_API_KEY[Math.floor(Math.random() * length)];
}


/**
 * @param {ContextType} context
 * @returns {boolean}
 */
export function isOpenAIEnable(context) {
    return context.USER_CONFIG.OPENAI_API_KEY.length > 0;
}


/**
 * @param {HistoryItem} item
 * @returns {Promise<object>}
 */
export async function renderOpenAIMessage(item) {
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
            switch (ENV.TELEGRAM_IMAGE_TRANSFER_MODE) {
            case 'base64':
                res.content.push({type: 'image_url', image_url: {
                    url: renderBase64DataURI(await imageToBase64String(image))
                }});
                break;
            case 'url':
            default:
                res.content.push({type: 'image_url', image_url: {url: image}});
                break;
            }
        }
    }
    return res;
}


/**
 * 发送消息到ChatGPT
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {Function} onStream
 * @returns {Promise<string>}
 */
export async function requestCompletionsFromOpenAI(params, context, onStream) {

    const {message, images, prompt, history} = params;
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };

    const messages = [...(history || []), {role: 'user', content: message, images}];
    if (prompt) {
        messages.unshift({role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt});
    }

    const body = {
        model: context.USER_CONFIG.OPENAI_CHAT_MODEL,
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: await Promise.all(messages.map(renderOpenAIMessage)),
        stream: onStream != null,
    };

    return requestChatCompletions(url, header, body, context, onStream);
}


/**
 * 请求Openai生成图片
 * @param {string} prompt
 * @param {ContextType} context
 * @returns {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/images/generations`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };
    const body = {
        prompt: prompt,
        n: 1,
        size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
        model: context.USER_CONFIG.DALL_E_MODEL,
    };
    if (body.model === 'dall-e-3') {
        body.quality = context.USER_CONFIG.DALL_E_IMAGE_QUALITY;
        body.style = context.USER_CONFIG.DALL_E_IMAGE_STYLE;
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    }).then((res) => res.json());

    if (resp.error?.message) {
        throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
}



