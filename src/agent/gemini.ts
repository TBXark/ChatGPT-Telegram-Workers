import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatStreamTextHandler, LLMChatParams, ResponseMessage } from './types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { requestChatCompletionsV2 } from './request';

export class Gemini implements ChatAgent {
    readonly name = 'gemini';
    readonly modelKey = 'GOOGLE_COMPLETIONS_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.GOOGLE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.GOOGLE_COMPLETIONS_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ResponseMessage[]> => {
        const provider = createGoogleGenerativeAI({
            baseURL: context.GOOGLE_API_BASE,
            apiKey: context.GOOGLE_API_KEY || undefined,
        });
        const languageModelV1 = provider.languageModel(this.model(context), undefined);
        return requestChatCompletionsV2({
            model: languageModelV1,
            prompt: params.prompt,
            messages: params.messages,
        }, onStream);
    };
}
