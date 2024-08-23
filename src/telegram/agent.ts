import { ENV } from '../config/env';
import { loadChatLLM } from '../agent/agents';
import {requestCompletionsFromLLM, StreamResultHandler} from '../agent/chat';
import type { HistoryModifier, LLMChatRequestParams } from '../agent/types';
import type { WorkerContext } from '../config/context';
import { sendChatActionToTelegramWithContext, sendMessageToTelegramWithContext } from './telegram';

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

        const llm = loadChatLLM(context.USER_CONFIG)?.request || null;
        if (llm === null) {
            return sendMessageToTelegramWithContext(context)('LLM is not enable');
        }
        const answer = await requestCompletionsFromLLM(params, context, llm, modifier, onStream);
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
