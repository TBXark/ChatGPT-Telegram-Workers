import type { SseChatCompatibleOptions } from './request';
import type {
    AgentEnable,
    AgentModel,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    ImageAgent,
    ImageAgentRequest,
    LLMChatParams,
} from './types';
import { type AgentUserConfig, ENV } from '#/config';
import { renderOpenAIMessages } from './openai';
import { isJsonResponse, mapResponseToAnswer, requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

async function sendWorkerRequest(model: string, body: any, id: string, token: string): Promise<Response> {
    return await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            method: 'POST',
            body: JSON.stringify(body),
        },
    );
};

function isWorkerAIEnable(context: AgentUserConfig): boolean {
    if (ENV.AI_BINDING) {
        return true;
    }
    return !!(context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN);
};

export class WorkersChat implements ChatAgent {
    readonly name = 'workers';
    readonly modelKey = 'WORKERS_CHAT_MODEL';
    readonly enable: AgentEnable = isWorkerAIEnable;

    readonly model: AgentModel = (ctx: AgentUserConfig): string | null => {
        return ctx.WORKERS_CHAT_MODEL;
    };

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const model = context.WORKERS_CHAT_MODEL;
        const body = {
            messages: await renderOpenAIMessages(prompt, messages, null),
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

        if (ENV.AI_BINDING) {
            const resp = ENV.AI_BINDING.run(model, body);
            const answer = mapResponseToAnswer(resp, new AbortController(), options, onStream);
            return convertStringToResponseMessages(answer);
        }

        const id = context.CLOUDFLARE_ACCOUNT_ID;
        const token = context.CLOUDFLARE_TOKEN;
        const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
        const header = {
            Authorization: `Bearer ${token}`,
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

export class WorkersImage implements ImageAgent {
    readonly name = 'workers';
    readonly modelKey = 'WORKERS_IMAGE_MODEL';
    readonly enable: AgentEnable = isWorkerAIEnable;

    readonly model: AgentModel = (ctx: AgentUserConfig): string => {
        return ctx.WORKERS_IMAGE_MODEL;
    };

    readonly request: ImageAgentRequest = async (prompt: string, context: AgentUserConfig): Promise<string | Blob> => {
        const id = context.CLOUDFLARE_ACCOUNT_ID;
        const token = context.CLOUDFLARE_TOKEN;
        let raw: Response | null = null;
        if (ENV.AI_BINDING) {
            raw = ENV.AI_BINDING.run(context.WORKERS_IMAGE_MODEL, { prompt });
        } else if (id && token) {
            raw = await sendWorkerRequest(context.WORKERS_IMAGE_MODEL, { prompt }, id, token);
        } else {
            throw new Error('Cloudflare account ID or token is not set');
        }
        if (!raw) {
            throw new Error('Invalid response');
        }
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
