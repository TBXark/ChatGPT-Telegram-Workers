import type { AgentUserConfig } from '#/config';
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
import { ImageSupportFormat, renderOpenAIMessages } from '#/agent/openai_compatibility';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

function azureHeader(context: AgentUserConfig): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'api-key': context.AZURE_API_KEY || '',
    };
}

export class AzureChatAI implements ChatAgent {
    readonly name = 'azure';
    readonly modelKey = 'AZURE_CHAT_MODEL';

    readonly enable: AgentEnable = ctx => !!(ctx.AZURE_API_KEY && ctx.AZURE_RESOURCE_NAME);
    readonly model: AgentModel = ctx => ctx.AZURE_CHAT_MODEL;

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${context.AZURE_CHAT_MODEL}/chat/completions?api-version=${context.AZURE_API_VERSION}`;
        const header = azureHeader(context);
        const body = {
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await renderOpenAIMessages(prompt, messages, [ImageSupportFormat.URL, ImageSupportFormat.BASE64]),
            stream: onStream != null,
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, null));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.AZURE_CHAT_MODELS_LIST) {
            context.AZURE_CHAT_MODELS_LIST = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/models?api-version=${context.AZURE_API_VERSION}`;
        }
        return loadModelsList(context.AZURE_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: azureHeader(context),
            }).then(res => res.json()) as any;
            return data.data?.map((model: any) => model.id) || [];
        });
    };
}

export class AzureImageAI implements ImageAgent {
    readonly name = 'azure';
    readonly modelKey = 'AZURE_DALLE_API';

    readonly enable: AgentEnable = ctx => !!(ctx.AZURE_API_KEY && ctx.AZURE_DALLE_API);
    readonly model: AgentModel = ctx => ctx.AZURE_IMAGE_MODEL;
    readonly modelList: AgentModelList = ctx => Promise.resolve([ctx.AZURE_IMAGE_MODEL]);

    readonly request: ImageAgentRequest = async (prompt: string, context: AgentUserConfig): Promise<string | Blob> => {
        const url = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${context.AZURE_IMAGE_MODEL}/images/generations?api-version=${context.AZURE_API_VERSION}`;
        const header = azureHeader(context);
        const body = {
            prompt,
            n: 1,
            size: context.DALL_E_IMAGE_SIZE,
            style: context.DALL_E_IMAGE_STYLE,
            quality: context.DALL_E_IMAGE_QUALITY,
        };
        const validSize = ['1792x1024', '1024x1024', '1024x1792'];
        if (!validSize.includes(body.size)) {
            body.size = '1024x1024';
        }
        const resp = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body),
        }).then(res => res.json()) as any;

        if (resp.error?.message) {
            throw new Error(resp.error.message);
        }
        return resp?.data?.at(0)?.url;
    };
}
