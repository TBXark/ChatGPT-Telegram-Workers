import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatStreamTextHandler, LLMChatParams, ResponseMessage } from './types';
import { renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages } from './utils';

export class Mistral implements ChatAgent {
    readonly name = 'mistral';
    readonly modelKey = 'MISTRAL_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.MISTRAL_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.MISTRAL_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ResponseMessage[]> => {
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
}
