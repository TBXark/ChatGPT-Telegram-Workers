import { ENV } from '../../config/env';
import { loadChatLLM } from '../../agent/agents';
import type { StreamResultHandler } from '../../agent/chat';
import { requestCompletionsFromLLM } from '../../agent/chat';
import type { HistoryModifier, LLMChatRequestParams } from '../../agent/types';
import type { WorkerContext } from '../../config/context';
import { getFileLink, sendChatActionToTelegramWithContext, sendMessageToTelegramWithContext } from '../api/telegram';
import type { TelegramMessage, TelegramPhoto } from '../../types/telegram';
import { uploadImageToTelegraph } from '../../utils/image';
import type { MessageHandler } from './type';

export async function chatWithLLM(params: LLMChatRequestParams, context: WorkerContext, modifier: HistoryModifier | null): Promise<Response> {
    try {
        try {
            const msg = await sendMessageToTelegramWithContext(context)('...').then(r => r.json()) as any;
            context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id;
            context.CURRENT_CHAT_CONTEXT.reply_markup = null;
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
        let onStream: StreamResultHandler | null = null;
        const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
        let nextEnableTime: number | null = null;
        if (ENV.STREAM_MODE) {
            context.CURRENT_CHAT_CONTEXT.parse_mode = null;
            onStream = async (text: string): Promise<any> => {
                try {
                    // 判断是否需要等待
                    if (nextEnableTime && nextEnableTime > Date.now()) {
                        return;
                    }
                    const resp = await sendMessageToTelegramWithContext(context)(text);
                    // 判断429
                    if (resp.status === 429) {
                        // 获取重试时间
                        const retryAfter = Number.parseInt(resp.headers.get('Retry-After') || '');
                        if (retryAfter) {
                            nextEnableTime = Date.now() + retryAfter * 1000;
                            return;
                        }
                    }
                    nextEnableTime = null;
                    if (resp.ok) {
                        context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json() as any).result.message_id;
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        }

        const agent = loadChatLLM(context.USER_CONFIG);
        if (agent === null) {
            return sendMessageToTelegramWithContext(context)('LLM is not enable');
        }
        const answer = await requestCompletionsFromLLM(params, context, agent, modifier, onStream);
        context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
        if (nextEnableTime !== null && nextEnableTime > Date.now()) {
            await new Promise(resolve => setTimeout(resolve, (nextEnableTime ?? 0) - Date.now()));
        }
        return sendMessageToTelegramWithContext(context)(answer);
    } catch (e) {
        let errMsg = `Error: ${(e as Error).message}`;
        if (errMsg.length > 2048) {
            // 裁剪错误信息 最长2048
            errMsg = errMsg.substring(0, 2048);
        }
        context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
        return sendMessageToTelegramWithContext(context)(errMsg);
    }
}

export function findPhotoFileID(photos: TelegramPhoto[], offset: number): string {
    let sizeIndex = 0;
    if (offset >= 0) {
        sizeIndex = offset;
    } else if (offset < 0) {
        sizeIndex = photos.length + offset;
    }
    sizeIndex = Math.max(0, Math.min(sizeIndex, photos.length - 1));
    return photos[sizeIndex].file_id;
}

export class ChatHandler implements MessageHandler {
    handle = async (message: TelegramMessage, context: WorkerContext): Promise<Response | null> => {
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
    };
}
