import type * as Telegram from 'telegram-bot-api-types';
import type { HistoryModifier, StreamResultHandler, UserContentPart, UserMessageItem } from '../../agent';
import type { WorkerContext } from '../../config';
import { loadChatLLM, requestCompletionsFromLLM } from '../../agent';
import { ENV } from '../../config';
import { createTelegramBotAPI } from '../api';
import { MessageSender } from '../sender';

export async function chatWithMessage(message: Telegram.Message, params: UserMessageItem | null, context: WorkerContext, modifier: HistoryModifier | null): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    try {
        try {
            const msg = await sender.sendPlainText('...').then(r => r.json()) as Telegram.ResponseWithMessage;
            sender.update({
                message_id: msg.result.message_id,
            });
        } catch (e) {
            console.error(e);
        }
        const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
        setTimeout(() => api.sendChatAction({
            chat_id: message.chat.id,
            action: 'typing',
        }).catch(console.error), 0);
        let onStream: StreamResultHandler | null = null;
        let nextEnableTime: number | null = null;
        if (ENV.STREAM_MODE) {
            onStream = async (text: string): Promise<any> => {
                try {
                    // 判断是否需要等待
                    if (nextEnableTime && nextEnableTime > Date.now()) {
                        return;
                    }
                    const resp = await sender.sendPlainText(text);
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
                        const respJson = await resp.json() as Telegram.ResponseWithMessage;
                        sender.update({
                            message_id: respJson.result.message_id,
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        }

        const agent = loadChatLLM(context.USER_CONFIG);
        if (agent === null) {
            return sender.sendPlainText('LLM is not enable');
        }
        const answer = await requestCompletionsFromLLM(params, context, agent, modifier, onStream);
        if (nextEnableTime !== null && nextEnableTime > Date.now()) {
            await new Promise(resolve => setTimeout(resolve, (nextEnableTime ?? 0) - Date.now()));
        }
        return sender.sendRichText(answer);
    } catch (e) {
        let errMsg = `Error: ${(e as Error).message}`;
        if (errMsg.length > 2048) {
            // 裁剪错误信息 最长2048
            errMsg = errMsg.substring(0, 2048);
        }
        return sender.sendPlainText(errMsg);
    }
}

export async function extractImageURL(fileId: string | null, context: WorkerContext): Promise<URL | null> {
    if (!fileId) {
        return null;
    }
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    const file = await api.getFileWithReturns({ file_id: fileId });
    const filePath = file.result.file_path;
    if (filePath) {
        const url = URL.parse(`${ENV.TELEGRAM_API_DOMAIN}/file/bot${context.SHARE_CONTEXT.botToken}/${filePath}`);
        if (url) {
            return url;
        }
    }
    return null;
}

export function extractImageFileID(message: Telegram.Message): string | null {
    if (message.photo && message.photo.length > 0) {
        const offset = ENV.TELEGRAM_PHOTO_SIZE_OFFSET;
        const length = message.photo.length;
        const sizeIndex = Math.max(0, Math.min(offset >= 0 ? offset : length + offset, length - 1));
        return message.photo[sizeIndex]?.file_id;
    } else if (message.document && message.document.thumbnail) {
        return message.document.thumbnail.file_id;
    }
    return null;
}

export async function extractUserMessageItem(message: Telegram.Message, context: WorkerContext): Promise<UserMessageItem> {
    const text = message.text || message.caption || '';
    const params: UserMessageItem = {
        role: 'user',
        content: text,
    };
    const url = await extractImageURL(extractImageFileID(message), context);
    if (url) {
        const contents = new Array<UserContentPart>();
        if (text) {
            contents.push({ type: 'text', text });
        }
        contents.push({ type: 'image', image: url });
        params.content = contents;
    }
    return params;
}
