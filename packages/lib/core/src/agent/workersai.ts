import type { AgentUserConfig, AiTextGenerationOutput, AiTextToImageOutput } from '#/config';
import type { SseChatCompatibleOptions } from './request';
import type {
    AgentEnable,
    AgentModel,
    AgentModelList,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    ImageAgent,
    ImageAgentRequest,
    LLMChatParams,
} from './types';
import { renderOpenAIMessages } from '#/agent/openai_compatibility';
import { ENV } from '#/config';
import { isJsonResponse, mapResponseToAnswer, requestChatCompletions } from './request';
import { bearerHeader, convertStringToResponseMessages, getAgentUserConfigFieldName, loadModelsList } from './utils';

function isWorkerAIEnable(context: AgentUserConfig): boolean {
    if (ENV.AI_BINDING) {
        return true;
    }
    return !!(context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN);
}

function loadWorkersModelList(task: string, loader: (context: AgentUserConfig) => string): (context: AgentUserConfig) => Promise<string[]> {
    return async (context: AgentUserConfig): Promise<string[]> => {
        let uri = loader(context);
        if (uri === '') {
            const id = context.CLOUDFLARE_ACCOUNT_ID;
            const taskEncoded = encodeURIComponent(task);
            uri = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/models/search?task=${taskEncoded}`;
        }
        return loadModelsList(uri, async (url): Promise<string[]> => {
            const header = {
                Authorization: `Bearer ${context.CLOUDFLARE_TOKEN}`,
            };
            const data = await fetch(url, { headers: header }).then(res => res.json());
            return data.result?.map((model: any) => model.name) || [];
        });
    };
}

export class WorkersChat implements ChatAgent {
    readonly name = 'workers';
    readonly modelKey = getAgentUserConfigFieldName('WORKERS_CHAT_MODEL');
    readonly enable: AgentEnable = isWorkerAIEnable;

    readonly model: AgentModel = ctx => ctx.WORKERS_CHAT_MODEL;
    readonly modelList: AgentModelList = loadWorkersModelList('Text Generation', ctx => ctx.WORKERS_CHAT_MODELS_LIST);

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
            const answer = await ENV.AI_BINDING.run(model, body);
            const response = WorkersChat.outputToResponse(answer, onStream !== null);
            return convertStringToResponseMessages(mapResponseToAnswer(response, new AbortController(), options, onStream));
        } else if (context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN) {
            const id = context.CLOUDFLARE_ACCOUNT_ID;
            const token = context.CLOUDFLARE_TOKEN;
            const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
            const header = bearerHeader(token, onStream !== null);
            return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, options));
        } else {
            throw new Error('Cloudflare account ID and token are required');
        }
    };

    static outputToResponse(output: AiTextGenerationOutput, stream: boolean): Response {
        if (stream && output instanceof ReadableStream) {
            return new Response(output, {
                headers: { 'content-type': 'text/event-stream' },
            });
        } else {
            return Response.json({ result: output });
        }
    };
}

export class WorkersImage implements ImageAgent {
    readonly name = 'workers';
    readonly modelKey = getAgentUserConfigFieldName('WORKERS_IMAGE_MODEL');
    readonly enable: AgentEnable = isWorkerAIEnable;

    readonly model: AgentModel = ctx => ctx.WORKERS_IMAGE_MODEL;
    readonly modelList: AgentModelList = loadWorkersModelList('Text-to-Image', ctx => ctx.WORKERS_IMAGE_MODELS_LIST);

    readonly request: ImageAgentRequest = async (prompt: string, context: AgentUserConfig): Promise<string | Blob> => {
        if (ENV.AI_BINDING) {
            const answer = await ENV.AI_BINDING.run(context.WORKERS_IMAGE_MODEL, { prompt });
            const raw = WorkersImage.outputToResponse(answer);
            return await WorkersImage.responseToImage(raw);
        } else if (context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN) {
            const id = context.CLOUDFLARE_ACCOUNT_ID;
            const token = context.CLOUDFLARE_TOKEN;
            const raw = await WorkersImage.fetch(context.WORKERS_IMAGE_MODEL, { prompt }, id, token);
            return await WorkersImage.responseToImage(raw);
        } else {
            throw new Error('Cloudflare account ID and token are required');
        }
    };

    static outputToResponse(output: AiTextToImageOutput): Response {
        if (output instanceof ReadableStream) {
            return new Response(output, {
                headers: {
                    'content-type': 'image/jpg',
                },
            });
        } else {
            return Response.json({ result: output });
        }
    };

    static async responseToImage(output: Response): Promise<string | Blob> {
        if (isJsonResponse(output)) {
            const { result } = await output.json();
            const image = result?.image;
            if (typeof image !== 'string') {
                throw new TypeError('Invalid image response');
            }
            return WorkersImage.base64StringToBlob(image);
        }
        return await output.blob();
    };

    static async base64StringToBlob(base64String: string): Promise<Blob> {
        if (typeof Buffer !== 'undefined') {
            const buffer = Buffer.from(base64String, 'base64');
            return new Blob([buffer], { type: 'image/png' });
        } else {
            const uint8Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
            return new Blob([uint8Array], { type: 'image/png' });
        }
    };

    static async fetch(model: string, body: any, id: string, token: string): Promise<Response> {
        return await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                method: 'POST',
                body: JSON.stringify(body),
            },
        );
    };
}
