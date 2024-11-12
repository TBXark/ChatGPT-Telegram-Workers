import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { ChatAgent, ChatAgentResponse, ChatStreamTextHandler, LLMChatParams } from './types';
import { renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.COHERE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
        return ctx.COHERE_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.COHERE_API_BASE}/chat`;
        const header = {
            'Authorization': `Bearer ${context.COHERE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
        };
        const body = {
            messages: await renderOpenAIMessages(prompt, messages),
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
                headers: { Authorization: `Bearer ${context.COHERE_API_KEY}` },
            }).then(res => res.json());
            return data.models?.filter((model: any) => model.endpoints?.includes('chat')).map((model: any) => model.name) || [];
        });
    };
}
