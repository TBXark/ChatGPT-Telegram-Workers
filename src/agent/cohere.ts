import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatStreamTextHandler, LLMChatParams, ResponseMessage } from './types';
import { createCohere } from '@ai-sdk/cohere';
import { requestChatCompletionsV2 } from './request';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.COHERE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.COHERE_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ResponseMessage[]> => {
        const provider = createCohere({
            baseURL: context.COHERE_API_BASE,
            apiKey: context.COHERE_API_KEY || undefined,
        });
        const languageModelV1 = provider.languageModel(this.model(context), undefined);
        return requestChatCompletionsV2({
            model: languageModelV1,
            prompt: params.prompt,
            messages: params.messages,
        }, onStream);
    };
}
