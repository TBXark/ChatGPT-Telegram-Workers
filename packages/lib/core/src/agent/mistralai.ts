import type { AgentUserConfig } from '#/config';
import type {
    AgentEnable,
    AgentModel,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    LLMChatParams,
} from './types';
import { ImageSupportFormat, renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { bearerHeader, convertStringToResponseMessages, loadModelsList } from './utils';

export class Mistral implements ChatAgent {
    readonly name = 'mistral';
    readonly modelKey = 'MISTRAL_CHAT_MODEL';

    readonly enable: AgentEnable = (context: AgentUserConfig): boolean => {
        return !!(context.MISTRAL_API_KEY);
    };

    readonly model: AgentModel = (ctx: AgentUserConfig): string | null => {
        return ctx.MISTRAL_CHAT_MODEL;
    };

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.MISTRAL_API_BASE}/chat/completions`;
        const header = bearerHeader(context.MISTRAL_API_KEY);

        const body = {
            model: context.MISTRAL_CHAT_MODEL,
            messages: await renderOpenAIMessages(prompt, messages, [ImageSupportFormat.URL]),
            stream: onStream != null,
        };

        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, null));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.MISTRAL_CHAT_MODELS_LIST === '') {
            context.MISTRAL_CHAT_MODELS_LIST = `${context.MISTRAL_API_BASE}/models`;
        }
        return loadModelsList(context.MISTRAL_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: bearerHeader(context.MISTRAL_API_KEY),
            }).then(res => res.json()) as any;
            return data.data?.map((model: any) => model.id) || [];
        });
    };
}
