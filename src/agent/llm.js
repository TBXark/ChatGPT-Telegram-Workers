import {
    deleteMessageFromTelegramWithContext,
    sendChatActionToTelegramWithContext,
    sendMessageToTelegramWithContext,
} from '../telegram/telegram.js';
import {DATABASE, ENV} from '../config/env.js';
// eslint-disable-next-line no-unused-vars
import {Context} from '../config/context.js';
import {chatLlmAgents, imageGenAgents} from "./agents.js";

/**
 * @return {(function(string): number)}
 */
function tokensCounter() {
    return (text) => {
        return text.length;
    };
}

/**
 * 加载历史TG消息
 *
 * @param {string} key
 * @param {Context} context
 * @return {Promise<Object>}
 */
async function loadHistory(key, context) {
    const initMessage = {
        role: 'system',
        content: context.USER_CONFIG.SYSTEM_INIT_MESSAGE || 'You are a useful assistant!'
    };
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;

    // 判断是否禁用历史记录
    if (historyDisable) {
        initMessage.role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
        return {real: [initMessage], original: [initMessage]};
    }

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


    let original = JSON.parse(JSON.stringify(history));

    const counter = tokensCounter();

    const trimHistory = (list, initLength, maxLength, maxToken) => {
        // 历史记录超出长度需要裁剪
        if (list.length > maxLength) {
            list = list.splice(list.length - maxLength);
        }
        // 处理token长度问题
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
        return list;
    };

    // 裁剪
    if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
        const initLength = counter(initMessage.content);
        history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
        original = trimHistory(original, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    }

    // 插入init
    switch (history.length > 0 ? history[0].role : '') {
        case 'assistant': // 第一条为机器人，替换成init
        case 'system': // 第一条为system，用新的init替换
            history[0] = initMessage;
            break;
        default:// 默认给第一条插入init
            history.unshift(initMessage);
    }

    // 如果第一条是system,替换role为SYSTEM_INIT_MESSAGE_ROLE
    if (ENV.SYSTEM_INIT_MESSAGE_ROLE !== 'system' && history.length > 0 && history[0].role === 'system') {
        history[0].role = ENV.SYSTEM_INIT_MESSAGE_ROLE;
    }

    return {real: history, original: original};
}


/**
 * 加载聊天AI
 *
 * @param {Context} context
 * @return {function}
 */
export function loadChatLLM(context) {
    for (const llm of chatLlmAgents) {
        if (llm.name === context.USER_CONFIG.AI_PROVIDER) {
            return llm.request;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const llm of chatLlmAgents) {
        if (llm.enable(context)) {
            return llm.request;
        }
    }
    return null;
}


/**
 * 加载图片AI
 *
 * @param {Context} context
 * @return {function}
 */
export function loadImageGen(context) {
    for (const imgGen of imageGenAgents) {
        if (imgGen.name === context.USER_CONFIG.AI_IMAGE_PROVIDER) {
            return imgGen.request;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const imgGen of imageGenAgents) {
        if (imgGen.enable(context)) {
            return imgGen.request;
        }
    }
    return null;
}

/**
 *
 * @param {string} text
 * @param {Context} context
 * @param {function} llm
 * @param {function} modifier
 * @param {function} onStream
 * @return {Promise<string>}
 */
async function requestCompletionsFromLLM(text, context, llm, modifier, onStream) {
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
    let history = await loadHistory(historyKey, context);
    if (modifier) {
        const modifierData = modifier(history, text);
        history = modifierData.history;
        text = modifierData.text;
    }
    const {real: realHistory, original: originalHistory} = history;
    const answer = await llm(text, realHistory, context, onStream);
    if (!historyDisable) {
        originalHistory.push({role: 'user', content: text || ''});
        originalHistory.push({role: 'assistant', content: answer});
        await DATABASE.put(historyKey, JSON.stringify(originalHistory)).catch(console.error);
    }
    return answer;
}

/**
 * 与LLM聊天
 *
 * @param {string|null} text
 * @param {Context} context
 * @param {function} modifier
 * @return {Promise<Response>}
 */
export async function chatWithLLM(text, context, modifier) {
    try {
        try {
            const msg = await sendMessageToTelegramWithContext(context)(ENV.I18N.message.loading).then((r) => r.json());
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
                            return
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

        const llm = loadChatLLM(context);
        if (llm === null) {
            return sendMessageToTelegramWithContext(context)(`LLM is not enable`);
        }
        const answer = await requestCompletionsFromLLM(text, context, llm, modifier, onStream);
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
        if (errMsg.length > 2048) { // 裁剪错误信息 最长2048
            errMsg = errMsg.substring(0, 2048);
        }
        context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
        return sendMessageToTelegramWithContext(context)(errMsg);
    }
}
