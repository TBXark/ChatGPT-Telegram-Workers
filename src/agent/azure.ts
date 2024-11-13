import type { AgentUserConfig } from '../config/env';
import type {
    ChatAgent,
    ChatAgentResponse,
    ChatStreamTextHandler,
    ImageAgent,
    LLMChatParams,
} from './types';
import { renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

class AzureBase {
    readonly name = 'azure';
    readonly modelFromURI = (uri: string | null): string => {
        if (!uri) {
            return '';
        }
        try {
            const url = new URL(uri);
            return url.pathname.split('/')[3];
        } catch {
            return uri;
        }
    };
}

export class AzureChatAI extends AzureBase implements ChatAgent {
    readonly modelKey = 'AZURE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.AZURE_API_KEY && context.AZURE_RESOURCE_NAME);
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
        return ctx.AZURE_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${context.AZURE_CHAT_MODEL}/chat/completions?api-version=${context.AZURE_API_VERSION}`;
        const header = {
            'Content-Type': 'application/json',
            'api-key': context.AZURE_API_KEY || '',
        };
        const body = {
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await renderOpenAIMessages(prompt, messages, true),
            stream: onStream != null,
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        return loadModelsList(context.AZURE_CHAT_MODELS_LIST);
    };
}

export class AzureImageAI extends AzureBase implements ImageAgent {
    readonly modelKey = 'AZURE_DALLE_API';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.AZURE_API_KEY && context.AZURE_DALLE_API);
    };

    readonly model = (ctx: AgentUserConfig) => {
        return this.modelFromURI(ctx.AZURE_DALLE_API);
    };

    readonly request = async (prompt: string, context: AgentUserConfig): Promise<string> => {
        const url = `https://${context.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${context.AZURE_CHAT_MODEL}/images/generations?api-version=${context.AZURE_API_VERSION}`;
        const header = {
            'Content-Type': 'application/json',
            'api-key': context.AZURE_API_KEY || '',
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
        return resp?.data?.at(0)?.url;
    };
}
