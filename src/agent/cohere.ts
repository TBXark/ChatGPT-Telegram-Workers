import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { SSEMessage, SSEParserResult } from './stream';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import { requestChatCompletions } from './request';
import { Stream } from './stream';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.COHERE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.COHERE_CHAT_MODEL;
    };

    private render = (item: HistoryItem): any => {
        return {
            role: item.role,
            message: item.content,
        };
    };

    static parser(sse: SSEMessage): SSEParserResult {
        switch (sse.event) {
            case 'content-delta':
                try {
                    return { data: JSON.parse(sse.data || '') };
                } catch (e) {
                    console.error(e, sse.data);
                    return {};
                }
            case 'stream-start':
                return {};
            case '[DONE]':
                return { finish: true };
            default:
                return {};
        }
    }

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
