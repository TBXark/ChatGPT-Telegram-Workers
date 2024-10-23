import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatStreamTextHandler, ImageAgent, LLMChatParams, ResponseMessage } from './types';
import { createAzure } from '@ai-sdk/azure';
import { requestChatCompletionsV2 } from './request';

export class AzureChatAI implements ChatAgent {
    readonly name = 'azure';

    readonly modelKey = 'AZURE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.AZURE_API_KEY && context.AZURE_RESOURCE_NAME && context.AZURE_CHAT_MODEL);
    };

    readonly model = (ctx: AgentUserConfig) => {
        return ctx.AZURE_CHAT_MODEL || '';
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ResponseMessage[]> => {
        const provider = createAzure({
            resourceName: context.AZURE_RESOURCE_NAME || undefined,
            apiKey: context.AZURE_API_KEY || undefined,
        });
        const languageModelV1 = provider.languageModel(context.AZURE_CHAT_MODEL || '', undefined);
        return requestChatCompletionsV2({
            model: languageModelV1,
            prompt: params.prompt,
            messages: params.messages,
        }, onStream);
    };
}

export class AzureImageAI implements ImageAgent {
    readonly name = 'azure';

    readonly modelKey = 'AZURE_IMAGE_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.AZURE_API_KEY && context.AZURE_RESOURCE_NAME && context.AZURE_IMAGE_MODEL);
    };

    readonly model = (ctx: AgentUserConfig) => {
        return ctx.AZURE_IMAGE_MODEL || '';
    };

    readonly request = async (prompt: string, context: AgentUserConfig): Promise<string> => {
        const url = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${context.AZURE_IMAGE_MODEL}/chat/completions?${context.AZURE_API_VERSION}`;
        if (!url || !context.AZURE_API_KEY) {
            throw new Error('Azure DALL-E API is not set');
        }
        const header = {
            'Content-Type': 'application/json',
            'api-key': context.AZURE_API_KEY,
        };
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
        return resp?.data?.[0]?.url;
    };
}
