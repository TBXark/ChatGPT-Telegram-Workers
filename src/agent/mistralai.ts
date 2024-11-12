import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatAgentResponse, ChatStreamTextHandler, LLMChatParams } from './types';
import { renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

export class Mistral implements ChatAgent {
    readonly name = 'mistral';
    readonly modelKey = 'MISTRAL_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.MISTRAL_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
        return ctx.MISTRAL_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.MISTRAL_API_BASE}/chat/completions`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.MISTRAL_API_KEY}`,
        };

        const body = {
            model: context.MISTRAL_CHAT_MODEL,
            messages: await renderOpenAIMessages(prompt, messages),
            stream: onStream != null,
        };

        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.MISTRAL_CHAT_MODELS_LIST === '') {
            context.MISTRAL_CHAT_MODELS_LIST = `${context.MISTRAL_API_BASE}/models`;
        }
        return loadModelsList(context.MISTRAL_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: { Authorization: `Bearer ${context.MISTRAL_API_KEY}` },
            }).then(res => res.json());
            return data.data?.map((model: any) => model.id) || [];
        });
    };
}
