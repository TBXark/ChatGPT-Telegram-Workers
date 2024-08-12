import {CONST, DATABASE, ENV} from '../config/env.js';
import {Context} from '../config/context.js';
import {getBot, getFileLink, sendMessageToTelegramWithContext} from './telegram.js';
import {handleCommandMessage} from './command.js';
import {errorToString} from '../utils/utils.js';
import {chatWithLLM} from '../agent/llm.js';

import '../types/telegram.js';
import {uploadImageToTelegraph} from '../utils/image.js';


/**
 * 初始化聊天上下文
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgInitChatContext(message, context) {
    await context.initContext(message);
    return null;
}


/**
 * 保存最后一条消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgSaveLastMessage(message, context) {
    if (ENV.DEBUG_MODE) {
        const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
        await DATABASE.put(lastMessageKey, JSON.stringify(message), {expirationTtl: 3600});
    }
    return null;
}

/**
 * 忽略旧的消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgIgnoreOldMessage(message, context) {
    if (ENV.SAFE_MODE) {
        let idList = [];
        try {
            idList = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.chatLastMessageIdKey).catch(() => '[]')) || [];
        } catch (e) {
            console.error(e);
        }
        // 保存最近的100条消息，如果存在则忽略，如果不存在则保存
        if (idList.includes(message.message_id)) {
            throw new Error('Ignore old message');
        } else {
            idList.push(message.message_id);
            if (idList.length > 100) {
                idList.shift();
            }
            await DATABASE.put(context.SHARE_CONTEXT.chatLastMessageIdKey, JSON.stringify(idList));
        }
    }
    return null;
}

/**
 * 检查环境变量是否设置
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgCheckEnvIsReady(message, context) {
    if (!DATABASE) {
        return sendMessageToTelegramWithContext(context)('DATABASE Not Set');
    }
    return null;
}

/**
 * 过滤非白名单用户
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgFilterWhiteList(message, context) {
    if (ENV.I_AM_A_GENEROUS_PERSON) {
        return null;
    }
    // 判断私聊消息
    if (context.SHARE_CONTEXT.chatType === 'private') {
    // 白名单判断
        if (!ENV.CHAT_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
            return sendMessageToTelegramWithContext(context)(
                `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${context.CURRENT_CHAT_CONTEXT.chat_id}`,
            );
        }
        return null;
    }

    // 判断群组消息
    if (CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
    // 未打开群组机器人开关,直接忽略
        if (!ENV.GROUP_CHAT_BOT_ENABLE) {
            throw new Error('Not support');
        }
        // 白名单判断
        if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
            return sendMessageToTelegramWithContext(context)(
                `Your group are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${context.CURRENT_CHAT_CONTEXT.chat_id}`,
            );
        }
        return null;
    }
    return sendMessageToTelegramWithContext(context)(
        `Not support chat type: ${context.SHARE_CONTEXT.chatType}`,
    );
}


/**
 * 过滤不支持的消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
// eslint-disable-next-line no-unused-vars
async function msgFilterUnsupportedMessage(message, context) {
    if (message.text) {
        return null;// 纯文本消息
    }
    if (message.caption) {
        return null;// 图文消息
    }
    if (message.photo) {
        return null;// 图片消息
    }
    throw new Error('Not supported message type');
}

/**
 * 处理群消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgHandleGroupMessage(message, context) {
    // 非群组消息不作判断，交给下一个中间件处理
    if (!CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
        return null;
    }

    // 处理群组消息，过滤掉AT部分
    let botName = context.SHARE_CONTEXT.currentBotName;
    if (message.reply_to_message) {
        if (`${message.reply_to_message.from.id}` === context.SHARE_CONTEXT.currentBotId) {
            return null;
        } else if (ENV.EXTRA_MESSAGE_CONTEXT) {
            context.SHARE_CONTEXT.extraMessageContext = message.reply_to_message;
        }
    }
    if (!botName) {
        const res = await getBot(context.SHARE_CONTEXT.currentBotToken);
        context.SHARE_CONTEXT.currentBotName = res.info.bot_name;
        botName = res.info.bot_name;
    }
    if (!botName) {
        throw new Error('Not set bot name');
    }
    if (!message.entities) {
        throw new Error('No entities');
    }

    const {text, caption} = message;
    let originContent = text || caption || '';
    if (!originContent) {
        throw new Error('Empty message');
    }

    let content = '';
    let offset = 0;
    let mentioned = false;

    for (const entity of message.entities) {
        switch (entity.type) {
        case 'bot_command':
            if (!mentioned) {
                const mention = originContent.substring(
                    entity.offset,
                    entity.offset + entity.length,
                );
                if (mention.endsWith(botName)) {
                    mentioned = true;
                }
                const cmd = mention
                    .replaceAll('@' + botName, '')
                    .replaceAll(botName, '')
                    .trim();
                content += cmd;
                offset = entity.offset + entity.length;
            }
            break;
        case 'mention':
        case 'text_mention':
            if (!mentioned) {
                const mention = originContent.substring(
                    entity.offset,
                    entity.offset + entity.length,
                );
                if (mention === botName || mention === '@' + botName) {
                    mentioned = true;
                }
            }
            content += originContent.substring(offset, entity.offset);
            offset = entity.offset + entity.length;
            break;
        }
    }
    content += originContent.substring(offset, originContent.length);
    message.text = content.trim();
    // 未AT机器人的消息不作处理
    if (!mentioned) {
        throw new Error('No mentioned');
    }
    return null;
}


/**
 * 响应命令消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgHandleCommand(message, context) {
    if (!message.text) {
    // 非文本消息不作处理
        return null;
    }
    return await handleCommandMessage(message, context);
}

/**
 * 与llm聊天
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function msgChatWithLLM(message, context) {
    const {text, caption} = message;
    let content = text || caption;
    if (ENV.EXTRA_MESSAGE_CONTEXT && context.SHARE_CONTEXT.extraMessageContext && context.SHARE_CONTEXT.extraMessageContext.text) {
        content = context.SHARE_CONTEXT.extraMessageContext.text + '\n' + text;
    }
    /**
     * @type {LlmRequestParams}
     */
    const params = {message: content};
    if (message.photo && message.photo.length > 0) {
        let sizeIndex = 0;
        if (ENV.TELEGRAM_PHOTO_SIZE_OFFSET >= 0) {
            sizeIndex = ENV.TELEGRAM_PHOTO_SIZE_OFFSET;
        } else if (ENV.TELEGRAM_PHOTO_SIZE_OFFSET < 0) {
            sizeIndex = message.photo.length + ENV.TELEGRAM_PHOTO_SIZE_OFFSET;
        }
        sizeIndex = Math.max(0, Math.min(sizeIndex, message.photo.length - 1));
        const fileId = message.photo[sizeIndex].file_id;
        let url = await getFileLink(fileId, context.SHARE_CONTEXT.currentBotToken);
        if (ENV.TELEGRAPH_ENABLE) {
            url = await uploadImageToTelegraph(url);
        }
        params.images = [url];
    }
    return chatWithLLM(params, context, null);
}


/**
 * 加载真实TG消息
 * @param {TelegramWebhookRequest} body
 * @returns {TelegramMessage}
 */
function loadMessage(body) {
    if (body?.edited_message) {
        throw new Error('Ignore edited message');
    }
    if (body?.message) {
        return body?.message;
    } else {
        throw new Error('Invalid message');
    }
}

/**
 * 处理消息
 * @param {string} token
 * @param {TelegramWebhookRequest} body
 * @returns {Promise<Response|null>}
 */
export async function handleMessage(token, body) {
    const context = new Context();
    context.initTelegramContext(token);
    const message = loadMessage(body);

    // 中间件定义 function (message: TelegramMessage, context: Context): Promise<Response|null>
    // 1. 当函数抛出异常时，结束消息处理，返回异常信息
    // 2. 当函数返回 Response 对象时，结束消息处理，返回 Response 对象
    // 3. 当函数返回 null 时，继续下一个中间件处理

    // 消息处理中间件
    const handlers = [
    // 初始化聊天上下文: 生成chat_id, reply_to_message_id(群组消息), SHARE_CONTEXT
        msgInitChatContext,
        // 检查环境是否准备好: DATABASE
        msgCheckEnvIsReady,
        // 过滤非白名单用户, 提前过滤减少KV消耗
        msgFilterWhiteList,
        // 过滤不支持的消息(抛出异常结束消息处理)
        msgFilterUnsupportedMessage,
        // 处理群消息，判断是否需要响应此条消息
        msgHandleGroupMessage,
        // 忽略旧消息
        msgIgnoreOldMessage,
        // DEBUG: 保存最后一条消息,按照需求自行调整此中间件位置
        msgSaveLastMessage,
        // 处理命令消息
        msgHandleCommand,
        // 与llm聊天
        msgChatWithLLM,
    ];

    for (const handler of handlers) {
        try {
            const result = await handler(message, context);
            if (result) {
                return result;
            }
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), {status: 500});
        }
    }
    return null;
}
