import { DATABASE, ENV } from '../config/env';
import { WorkerContext } from '../config/context';
import { uploadImageToTelegraph } from '../utils/image';
import { errorToString } from '../utils/utils';
import type { TelegramMessage, TelegramWebhookRequest } from '../types/telegram';
import { isTelegramChatTypeGroup } from '../types/telegram';
import type { LLMChatRequestParams } from '../agent/types';
import { getBotName, getFileLink, sendMessageToTelegramWithContext } from './telegram';
import { handleCommandMessage } from './command';

import { checkMention, findPhotoFileID } from './utils';
import { chatWithLLM } from './agent';

async function msgSaveLastMessage(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
    if (ENV.DEBUG_MODE) {
        const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
        await DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
    }
    return null;
}

async function msgIgnoreOldMessage(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
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

async function msgCheckEnvIsReady(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
    if (!DATABASE) {
        return sendMessageToTelegramWithContext(context)('DATABASE Not Set');
    }
    return null;
}

async function msgFilterWhiteList(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
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
    if (isTelegramChatTypeGroup(context.SHARE_CONTEXT.chatType)) {
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

// eslint-disable-next-line unused-imports/no-unused-vars
async function msgFilterUnsupportedMessage(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
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

async function msgHandleGroupMessage(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
    // 非群组消息不作判断，交给下一个中间件处理
    if (!isTelegramChatTypeGroup(context.SHARE_CONTEXT.chatType)) {
        return null;
    }

    // 处理回复消息, 如果回复的是当前机器人的消息交给下一个中间件处理
    if (message.reply_to_message) {
        if (`${message.reply_to_message.from.id}` === `${context.SHARE_CONTEXT.currentBotId}`) {
            return null;
        } else if (ENV.EXTRA_MESSAGE_CONTEXT) {
            context.SHARE_CONTEXT.extraMessageContext = message.reply_to_message;
        }
    }

    // 处理群组消息，过滤掉AT部分
    let botName = context.SHARE_CONTEXT.currentBotName;
    if (!botName) {
        botName = await getBotName(context.SHARE_CONTEXT.currentBotToken);
        context.SHARE_CONTEXT.currentBotName = botName;
    }
    if (!botName) {
        throw new Error('Not set bot name');
    }
    let isMention = false;
    // 检查text中是否有机器人的提及
    if (message.text && message.entities) {
        const res = checkMention(message.text, message.entities, botName, context.SHARE_CONTEXT.currentBotId);
        isMention = res.isMention;
        message.text = res.content.trim();
    }
    // 检查caption中是否有机器人的提及
    if (message.caption && message.caption_entities) {
        const res = checkMention(message.caption, message.caption_entities, botName, context.SHARE_CONTEXT.currentBotId);
        isMention = res.isMention || isMention;
        message.caption = res.content.trim();
    }
    if (!isMention) {
        throw new Error('Not mention');
    }
    return null;
}

async function msgHandleCommand(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
    if (!message.text) {
    // 非文本消息不作处理
        return null;
    }
    return await handleCommandMessage(message, context);
}

async function msgChatWithLLM(message: TelegramMessage, context: WorkerContext): Promise<Response | null> {
    const params: LLMChatRequestParams = {
        message: message.text || message.caption || '',
    };
    if (ENV.EXTRA_MESSAGE_CONTEXT && context.SHARE_CONTEXT.extraMessageContext) {
        const extra = context.SHARE_CONTEXT.extraMessageContext.text || context.SHARE_CONTEXT.extraMessageContext.caption || '';
        if (extra) {
            params.message = `${extra}\n${params.message}`;
        }
    }

    if (message.photo && message.photo.length > 0) {
        const id = findPhotoFileID(message.photo, ENV.TELEGRAM_PHOTO_SIZE_OFFSET);
        let url = await getFileLink(id, context.SHARE_CONTEXT.currentBotToken);
        if (ENV.TELEGRAPH_ENABLE) {
            url = await uploadImageToTelegraph(url);
        }
        params.images = [url];
    }
    return chatWithLLM(params, context, null);
}

function loadMessage(body: TelegramWebhookRequest): TelegramMessage {
    if (body?.edited_message) {
        throw new Error('Ignore edited message');
    }
    if (body?.message) {
        return body?.message;
    } else {
        throw new Error('Invalid message');
    }
}

export async function handleMessage(token: string, body: TelegramWebhookRequest): Promise<Response | null> {
    const message = loadMessage(body);
    const context = await WorkerContext.from(token, message);

    // 中间件定义 function (message: TelegramMessage, context: Context): Promise<Response|null>
    // 1. 当函数抛出异常时，结束消息处理，返回异常信息
    // 2. 当函数返回 Response 对象时，结束消息处理，返回 Response 对象
    // 3. 当函数返回 null 时，继续下一个中间件处理

    // 消息处理中间件
    const handlers = [
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
            return new Response(errorToString(e), { status: 500 });
        }
    }
    return null;
}
