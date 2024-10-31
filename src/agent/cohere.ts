import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { ChatAgent, ChatStreamTextHandler, LLMChatParams } from './types';
import { requestChatCompletions } from './request';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.COHERE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.COHERE_CHAT_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> => {
        const { message, prompt, history } = params;
        const url = `${context.COHERE_API_BASE}/chat`;
        const header = {
            'Authorization': `Bearer ${context.COHERE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
        };

        const messages = [...history || [], { role: 'user', content: message }];
        if (prompt) {
            messages.unshift({ role: 'assistant', content: prompt });
        }

        const body = {
            messages,
            model: context.COHERE_CHAT_MODEL,
            stream: onStream != null,
        };

        const options: SseChatCompatibleOptions = {};
        options.contentExtractor = function (data: any) {
            return data?.delta?.message?.content?.text;
        };
        options.fullContentExtractor = function (data: any) {
            return data?.messages[0].content;
        };
        options.errorExtractor = function (data: any) {
            return data?.message;
        };
        return requestChatCompletions(url, header, body, onStream, null, options);
    };
}
