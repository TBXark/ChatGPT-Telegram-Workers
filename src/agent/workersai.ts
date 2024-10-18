import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, ImageAgent, LLMChatParams } from './types';
import { isJsonResponse, requestChatCompletions } from './request';

class WorkerBase {
    readonly name = 'workers';
    readonly run = async (model: string, body: any, id: string, token: string): Promise<Response> => {
        return await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                method: 'POST',
                body: JSON.stringify(body),
            },
        );
    };

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN);
    };
}

export class WorkersChat extends WorkerBase implements ChatAgent {
    readonly modelKey = 'WORKERS_CHAT_MODEL';

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.WORKERS_CHAT_MODEL;
    };

    private render = (item: HistoryItem): any => {
        return {
            role: item.role,
            content: item.content,
        };
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> => {
        const { message, prompt, history } = params;
        const id = context.CLOUDFLARE_ACCOUNT_ID;
        const token = context.CLOUDFLARE_TOKEN;
        const model = context.WORKERS_CHAT_MODEL;
        const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
        const header = {
            Authorization: `Bearer ${token}`,
        };

        const messages = [...(history || []), { role: 'user', content: message }];
        if (prompt) {
            messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
        }

        const body = {
            messages: messages.map(this.render),
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
        return requestChatCompletions(url, header, body, onStream, null, options) as unknown as string;
    };
}

export class WorkersImage extends WorkerBase implements ImageAgent {
    readonly modelKey = 'WORKERS_IMAGE_MODEL';

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.WORKERS_IMAGE_MODEL;
    };

    readonly request = async (prompt: string, context: AgentUserConfig): Promise<Blob> => {
        const id = context.CLOUDFLARE_ACCOUNT_ID;
        const token = context.CLOUDFLARE_TOKEN;
        if (!id || !token) {
            throw new Error('Cloudflare account ID or token is not set');
        }
        const raw = await this.run(context.WORKERS_IMAGE_MODEL, { prompt }, id, token);
        if (isJsonResponse(raw)) {
            const { result } = await raw.json();
            const image = result?.image;
            if (typeof image !== 'string') {
                throw new TypeError('Invalid image response');
            }
            return base64StringToBlob(image);
        }
        return await raw.blob();
    };
}

async function base64StringToBlob(base64String: string): Promise<Blob> {
    try {
        const { Buffer } = await import('node:buffer');
        const buffer = Buffer.from(base64String, 'base64');
        return new Blob([buffer], { type: 'image/png' });
    } catch {
        const uint8Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
        return new Blob([uint8Array], { type: 'image/png' });
    }
}
