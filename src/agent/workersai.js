import "../types/context.js";
import {requestChatCompletions} from "./request.js";

/**
 * Run the specified AI model with the provided body data.
 * @param {string} model - The AI model to run.
 * @param {object} body - The data to provide to the AI model.
 * @param {string} id
 * @param {string} token
 * @returns {Promise<Response>} The response from the AI model.
 */
async function run(model, body, id, token) {
    return await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
        {
            headers: {Authorization: `Bearer ${token}`},
            method: 'POST',
            body: JSON.stringify(body),
        },
    );
}

/**
 * @param {ContextType} context
 * @returns {boolean}
 */
export function isWorkersAIEnable(context) {
    return !!(context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID && context.USER_CONFIG.CLOUDFLARE_TOKEN);
}

/**
 * @param {HistoryItem} item
 * @returns {object}
 */
function renderWorkerAIMessage(item) {
    return {
        role: item.role,
        content: item.content,
    };
}


/**
 * 发送消息到Workers AI
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {Function} onStream
 * @returns {Promise<string>}
 */
export async function requestCompletionsFromWorkersAI(params, context, onStream) {

    const {message, prompt, history} = params;
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const model = context.USER_CONFIG.WORKERS_CHAT_MODEL;
    const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
    const header = {
        Authorization: `Bearer ${token}`
    };

    const messages = [...(history || []), {role: 'user', content: message}];
    if (prompt) {
        messages.unshift({role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt});
    }

    const body = {
        messages: messages.map(renderWorkerAIMessage),
        stream: onStream !== null,
    };

    /**
     * @type {SseChatCompatibleOptions}
     */
    const options = {};
    options.contentExtractor = function (data) {
        return data?.response;
    };
    options.fullContentExtractor = function (data) {
        return data?.result?.response;
    };
    options.errorExtractor = function (data) {
        return data?.errors?.[0]?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

/**
 * @param {string} prompt
 * @param {ContextType} context
 * @returns {Promise<Blob>}
 */
export async function requestImageFromWorkersAI(prompt, context) {
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const raw = await run(context.USER_CONFIG.WORKERS_IMAGE_MODEL, {prompt}, id, token);
    return await raw.blob();
}
