import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type {
    ChatAgent,
    ChatAgentResponse,
    ChatStreamTextHandler,
    HistoryItem,
    ImageAgent,
    LLMChatParams,
} from './types';
import { renderOpenAIMessages } from './openai';
import { isJsonResponse, requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

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

    readonly model = (ctx: AgentUserConfig): string | null => {
        return ctx.WORKERS_CHAT_MODEL;
    };

    private render = (item: HistoryItem): any => {
        return {
            role: item.role,
            content: item.content,
        };
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const id = context.CLOUDFLARE_ACCOUNT_ID;
        const token = context.CLOUDFLARE_TOKEN;
        const model = context.WORKERS_CHAT_MODEL;
        const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
        const header = {
            Authorization: `Bearer ${token}`,
        };
        const body = {
            messages: await renderOpenAIMessages(prompt, messages),
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
            return data?.errors?.at(0)?.message;
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, options));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.WORKERS_CHAT_MODELS_LIST === '') {
            const id = context.CLOUDFLARE_ACCOUNT_ID;
            context.WORKERS_CHAT_MODELS_LIST = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/models/search?task=Text%20Generation`;
        }
        return loadModelsList(context.WORKERS_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const header = {
                Authorization: `Bearer ${context.CLOUDFLARE_TOKEN}`,
            };
            const data = await fetch(url, { headers: header }).then(res => res.json());
            return data.result?.map((model: any) => model.name) || [];
        });
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
    if (typeof Buffer !== 'undefined') {
        const buffer = Buffer.from(base64String, 'base64');
        return new Blob([buffer], { type: 'image/png' });
    } else {
        const uint8Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
        return new Blob([uint8Array], { type: 'image/png' });
    }
}
