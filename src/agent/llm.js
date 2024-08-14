import {
    deleteMessageFromTelegramWithContext,
    sendChatActionToTelegramWithContext,
    sendMessageToTelegramWithContext,
} from '../telegram/telegram.js';
import {DATABASE, ENV} from '../config/env.js';
import {loadChatLLM} from './agents.js';
import '../types/agent.js';

/**
 * @returns {(function(string): number)}
 */
function tokensCounter() {
    return (text) => {
        return text.length;
    };
}


/**
 * 加载历史TG消息
 * @param {string} key
 * @returns {Promise<HistoryItem[]>}
 */
async function loadHistory(key) {

    // 加载历史记录
    let history = [];
    try {
        history = JSON.parse(await DATABASE.get(key));
    } catch (e) {
        console.error(e);
    }
    if (!history || !Array.isArray(history)) {
        history = [];
    }

    const counter = tokensCounter();

    const trimHistory = (list, initLength, maxLength, maxToken) => {
    // 历史记录超出长度需要裁剪, 小于0不裁剪
        if (maxLength >= 0 && list.length > maxLength) {
            list = list.splice(list.length - maxLength);
        }
        // 处理token长度问题, 小于0不裁剪
        if (maxToken > 0) {
            let tokenLength = initLength;
            for (let i = list.length - 1; i >= 0; i--) {
                const historyItem = list[i];
                let length = 0;
                if (historyItem.content) {
                    length = counter(historyItem.content);
                } else {
                    historyItem.content = '';
                }
                // 如果最大长度超过maxToken,裁剪history
                tokenLength += length;
                if (tokenLength > maxToken) {
                    list = list.splice(i + 1);
                    break;
                }
            }
        }
        return list;
    };

    // 裁剪
    if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
        history = trimHistory(history, 0, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    }

    return history;
}

/**
 * @typedef {object} LlmModifierResult
 * @property {HistoryItem[]} history
 * @property {string} message
 * @typedef {function(HistoryItem[], string): LlmModifierResult} LlmModifier
 */

/**
 * @typedef {function (string): Promise<any>} StreamResultHandler
 */

/**
 * @param {LlmRequestParams} params
 * @param {ContextType} context
 * @param {ChatAgentRequest} llm
 * @param {LlmModifier} modifier
 * @param {StreamResultHandler} onStream
 * @returns {Promise<string>}
 */
async function requestCompletionsFromLLM(params, context, llm, modifier, onStream) {
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
    let history = await loadHistory(historyKey);
    if (modifier) {
        const modifierData = modifier(history, params.message);
        history = modifierData.history;
        params.message = modifierData.message;
    }
    const llmParams = {
        ...params,
        history,
        prompt: context.USER_CONFIG.SYSTEM_INIT_MESSAGE,
    };
    const answer = await llm(llmParams, context, onStream);
    if (!historyDisable) {
        history.push({role: 'user', content: params.message || '', images: params.images});
        history.push({role: 'assistant', content: answer});
        await DATABASE.put(historyKey, JSON.stringify(history)).catch(console.error);
    }
    return answer;
}

/**
 * 与LLM聊天
 * @param {LlmRequestParams} params
 * @param {ContextType} context
 * @param {LlmModifier} modifier
 * @returns {Promise<Response>}
 */
export async function chatWithLLM(params, context, modifier) {
    try {
        try {
            const msg = await sendMessageToTelegramWithContext(context)('...').then((r) => r.json());
            context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id;
            context.CURRENT_CHAT_CONTEXT.reply_markup = null;
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
        let onStream = null;
        const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
        let nextEnableTime = null;
        if (ENV.STREAM_MODE) {
            context.CURRENT_CHAT_CONTEXT.parse_mode = null;
            onStream = async (text) => {
                try {
                    // 判断是否需要等待
                    if (nextEnableTime && nextEnableTime > Date.now()) {
                        return;
                    }
                    const resp = await sendMessageToTelegramWithContext(context)(text);
                    // 判断429
                    if (resp.status === 429) {
                        // 获取重试时间
                        const retryAfter = parseInt(resp.headers.get('Retry-After'));
                        if (retryAfter) {
                            nextEnableTime = Date.now() + retryAfter * 1000;
                            return;
                        }
                    }
                    nextEnableTime = null;
                    if (resp.ok) {
                        context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json()).result.message_id;
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        }

        const llm = loadChatLLM(context)?.request;
        if (llm === null) {
            return sendMessageToTelegramWithContext(context)('LLM is not enable');
        }
        const answer = await requestCompletionsFromLLM(params, context, llm, modifier, onStream);
        context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
        if (ENV.SHOW_REPLY_BUTTON && context.CURRENT_CHAT_CONTEXT.message_id) {
            try {
                await deleteMessageFromTelegramWithContext(context)(context.CURRENT_CHAT_CONTEXT.message_id);
                context.CURRENT_CHAT_CONTEXT.message_id = null;
                context.CURRENT_CHAT_CONTEXT.reply_markup = {
                    keyboard: [[{text: '/new'}, {text: '/redo'}]],
                    selective: true,
                    resize_keyboard: true,
                    one_time_keyboard: true,
                };
            } catch (e) {
                console.error(e);
            }
        }
        if (nextEnableTime && nextEnableTime > Date.now()) {
            await new Promise((resolve) => setTimeout(resolve, nextEnableTime - Date.now()));
        }
        return sendMessageToTelegramWithContext(context)(answer);
    } catch (e) {
        let errMsg = `Error: ${e.message}`;
        if (errMsg.length > 2048) {
            // 裁剪错误信息 最长2048
            errMsg = errMsg.substring(0, 2048);
        }
        context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
        return sendMessageToTelegramWithContext(context)(errMsg);
    }
}

