/* eslint-disable no-unused-vars */
import {Context} from '../config/context.js';
import {DATABASE, ENV} from '../config/env.js';
import {requestChatCompletions} from "./request.js";


/**
 * @param {Context} context
 * @return {string|null}
 */
function openAIKeyFromContext(context) {
    if (context.USER_CONFIG.OPENAI_API_KEY) {
        return context.USER_CONFIG.OPENAI_API_KEY;
    }
    if (ENV.API_KEY.length === 0) {
        return null;
    }
    return ENV.API_KEY[Math.floor(Math.random() * ENV.API_KEY.length)];
}

/**
 * @param {Context} context
 * @return {string|null}
 */
function azureKeyFromContext(context) {
    return context.USER_CONFIG.AZURE_API_KEY || ENV.AZURE_API_KEY;
}


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isOpenAIEnable(context) {
    return context.USER_CONFIG.OPENAI_API_KEY || ENV.API_KEY.length > 0;
}

/**
 * @param {Context} context
 * @return {boolean}
 */
export function isAzureEnable(context) {
    // const api = context.USER_CONFIG.AZURE_COMPLETIONS_API || ENV.AZURE_COMPLETIONS_API;
    const key = context.USER_CONFIG.AZURE_API_KEY || ENV.AZURE_API_KEY;
    return key !== null;
}


/**
 * 发送消息到ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromOpenAI(message, history, context, onStream) {
    const url = `${ENV.OPENAI_API_BASE}/chat/completions`;

    const body = {
        model: context.USER_CONFIG.CHAT_MODEL,
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: [...(history || []), {role: 'user', content: message}],
        stream: onStream != null,
    };

    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };

    return requestChatCompletions(url, header, body, context, onStream, (result) => {
        setTimeout(() => updateBotUsage(result?.usage, context).catch(console.error), 0);
    });
}


/**
 * 发送消息到Azure ChatGPT
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromAzureOpenAI(message, history, context, onStream) {
    const url = context.USER_CONFIG.AZURE_COMPLETIONS_API;

    const body = {
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: [...(history || []), {role: 'user', content: message}],
        stream: onStream != null,
    };

    const header = {
        'Content-Type': 'application/json',
        'api-key': azureKeyFromContext(context),
    };

    return requestChatCompletions(url, header, body, context, onStream);
}

/**
 * 请求Openai生成图片
 *
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<string>}
 */
export async function requestImageFromOpenAI(prompt, context) {
    let url = `${ENV.OPENAI_API_BASE}/images/generations`;
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
    {
        const provider = context.USER_CONFIG.AI_IMAGE_PROVIDER;
        let isAzureModel = false;
        switch (provider) {
            case 'azure':
                isAzureModel = true;
                break;
            case 'openai':
                isAzureModel = false;
                break;
            case 'auto':
                isAzureModel = isAzureEnable(context) && context.USER_CONFIG.AZURE_DALLE_API !== null;
                break;
            default:
                break;
        }
        if (isAzureModel) {
            url = context.USER_CONFIG.AZURE_DALLE_API;
            const validSize = ['1792x1024', '1024x1024', '1024x1792'];
            if (!validSize.includes(body.size)) {
                body.size = '1024x1024';
            }
            header['api-key'] = azureKeyFromContext(context);
            delete header['Authorization'];
            delete body.model;
        }
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    }).then((res) => res.json());
    if (resp.error?.message) {
        throw new Error(resp.error.message);
    }
    return resp.data[0].url;
}

/**
 * 更新当前机器人的用量统计
 *
 * @param {object} usage
 * @param {Context} context
 * @return {Promise<void>}
 */
async function updateBotUsage(usage, context) {
    if (!ENV.ENABLE_USAGE_STATISTICS) {
        return;
    }

    let dbValue = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));

    if (!dbValue) {
        dbValue = {
            tokens: {
                total: 0,
                chats: {},
            },
        };
    }

    dbValue.tokens.total += usage.total_tokens;
    if (!dbValue.tokens.chats[context.SHARE_CONTEXT.chatId]) {
        dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] = usage.total_tokens;
    } else {
        dbValue.tokens.chats[context.SHARE_CONTEXT.chatId] += usage.total_tokens;
    }

    await DATABASE.put(context.SHARE_CONTEXT.usageKey, JSON.stringify(dbValue));
}
