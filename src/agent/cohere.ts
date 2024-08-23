import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import { Stream, cohereSseJsonParser } from './stream';
import type { SseChatCompatibleOptions } from './request';
import { requestChatCompletions } from './request';

export class Cohere implements ChatAgent {
    readonly name = 'cohere';
    readonly modelKey = 'COHERE_CHAT_MODEL';

    static COHERE_ROLE_MAP: Record<string, string> = {
        assistant: 'CHATBOT',
        user: 'USER',
    };

    enable(context: AgentUserConfig): boolean {
        return !!(context.COHERE_API_KEY);
    }

    model(ctx: AgentUserConfig) {
        return ctx.COHERE_CHAT_MODEL;
    }

    private render(item: HistoryItem): any {
        return {
            role: Cohere.COHERE_ROLE_MAP[item.role] || 'USER',
            content: item.content,
        };
    }

    async request(params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> {
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
            return new Stream(r, c, cohereSseJsonParser);
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
    }
}
