import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { SSEMessage, SSEParserResult } from './stream';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import { requestChatCompletions } from './request';
import { Stream } from './stream';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    static COHERE_ROLE_MAP: Record<string, string> = {
        assistant: 'CHATBOT',
        user: 'USER',
    };

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.COHERE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.COHERE_CHAT_MODEL;
    };

    private render = (item: HistoryItem): any => {
        return {
            role: Cohere.COHERE_ROLE_MAP[item.role] || 'USER',
            content: item.content,
        };
    };

    static parser(sse: SSEMessage): SSEParserResult {
        // example:
        //      event: text-generation
        //      data: {"is_finished":false,"event_type":"text-generation","text":"?"}
        //
        //      event: stream-end
        //      data: {"is_finished":true,...}
        switch (sse.event) {
            case 'text-generation':
                try {
                    return { data: JSON.parse(sse.data || '') };
                } catch (e) {
                    console.error(e, sse.data);
                    return {};
                }
            case 'stream-start':
                return {};
            case 'stream-end':
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

        const body = {
            message,
            model: context.COHERE_CHAT_MODEL,
            stream: onStream != null,
            preamble: prompt,
            chat_history: history?.map(this.render),
        };
        if (!body.preamble) {
            delete body.preamble;
        }

        const options: SseChatCompatibleOptions = {};
        options.streamBuilder = function (r, c) {
            return new Stream(r, c, Cohere.parser);
        };
        options.contentExtractor = function (data: any) {
            return data?.text;
        };
        options.fullContentExtractor = function (data: any) {
            return data?.text;
        };
        options.errorExtractor = function (data: any) {
            return data?.message;
        };
        return requestChatCompletions(url, header, body, onStream, null, options);
    };
}
