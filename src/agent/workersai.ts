import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, HistoryItem, LlmParams, SseChatCompatibleOptions } from './types';
import { requestChatCompletions } from './request';

async function run(model: string, body: any, id: string, token: string): Promise<Response> {
    return await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            method: 'POST',
            body: JSON.stringify(body),
        },
    );
}

export function isWorkersAIEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID && context.USER_CONFIG.CLOUDFLARE_TOKEN);
}

function renderWorkerAIMessage(item: HistoryItem): any {
    return {
        role: item.role,
        content: item.content,
    };
}

export async function requestCompletionsFromWorkersAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, prompt, history } = params;
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const model = context.USER_CONFIG.WORKERS_CHAT_MODEL;
    const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
    const header = {
        Authorization: `Bearer ${token}`,
    };

    const messages = [...(history || []), { role: 'user', content: message }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }

    const body = {
        messages: messages.map(renderWorkerAIMessage),
        stream: onStream !== null,
    };

    const options: SseChatCompatibleOptions = {};
    options.contentExtractor = function (data: any) {
        return data?.response;
    };
    options.fullContentExtractor = function (data: any) {
        return data?.result?.response;
    };
    options.errorExtractor = function (data: any) {
        return data?.errors?.[0]?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

export async function requestImageFromWorkersAI(prompt: string, context: WorkerContext): Promise<Blob> {
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const raw = await run(context.USER_CONFIG.WORKERS_IMAGE_MODEL, { prompt }, id, token);
    return await raw.blob();
}
