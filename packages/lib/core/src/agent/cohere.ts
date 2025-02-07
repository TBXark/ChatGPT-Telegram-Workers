import type { AgentUserConfig } from '#/config';
import type { SseChatCompatibleOptions } from './request';
import type {
    AgentEnable,
    AgentModel,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    LLMChatParams,
} from './types';
import { renderOpenAIMessages } from '#/agent/openai_compatibility';
import { requestChatCompletions } from './request';
import { bearerHeader, convertStringToResponseMessages, getAgentUserConfigFieldName, loadModelsList } from './utils';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = getAgentUserConfigFieldName('COHERE_CHAT_MODEL');

    readonly enable: AgentEnable = ctx => !!(ctx.COHERE_API_KEY);
    readonly model: AgentModel = ctx => ctx.COHERE_CHAT_MODEL;

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.COHERE_API_BASE}/chat`;
        const header = bearerHeader(context.COHERE_API_KEY, onStream !== null);
        const body = {
            ...(context.COHERE_CHAT_EXTRA_PARAMS || {}),
            messages: await renderOpenAIMessages(prompt, messages, null),
            model: context.COHERE_CHAT_MODEL,
            stream: onStream != null,
        };

        const options: SseChatCompatibleOptions = {};
        options.contentExtractor = function (data: any) {
            return data?.delta?.message?.content?.text;
        };
        options.fullContentExtractor = function (data: any) {
            return data?.messages?.at(0)?.content;
        };
        options.errorExtractor = function (data: any) {
            return data?.message;
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, options));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.COHERE_CHAT_MODELS_LIST === '') {
            const { protocol, host } = new URL(context.COHERE_API_BASE);
            context.COHERE_CHAT_MODELS_LIST = `${protocol}://${host}/v2/models`;
        }
        return loadModelsList(context.COHERE_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: bearerHeader(context.COHERE_API_KEY),
            }).then(res => res.json()) as any;
            return data.models?.filter((model: any) => model.endpoints?.includes('chat')).map((model: any) => model.name) || [];
        });
    };
}
