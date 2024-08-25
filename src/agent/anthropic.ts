import { imageToBase64String } from '../utils/image';
import { ENV } from '../config/share';
import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import type { SSEMessage, SSEParserResult } from './stream';
import { Stream } from './stream';
import type { SseChatCompatibleOptions } from './request';
import { requestChatCompletions } from './request';

export class Anthropic implements ChatAgent {
    readonly name = 'anthropic';
    readonly modelKey = 'ANTHROPIC_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.ANTHROPIC_API_KEY);
    };

    private render = async (item: HistoryItem): Promise<any> => {
        const res: Record<string, any> = {
            role: item.role,
            content: item.content,
        };

        if (item.images && item.images.length > 0) {
            res.content = [];
            if (item.content) {
                res.content.push({ type: 'text', text: item.content });
            }
            for (const image of item.images) {
                res.content.push(await imageToBase64String(image).then(({ format, data }) => {
                    return { type: 'image', source: { type: 'base64', media_type: format, data } };
                }));
            }
        }
        return res;
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.ANTHROPIC_CHAT_MODEL;
    };

    private static parser(sse: SSEMessage): SSEParserResult {
        // example:
        //      event: content_block_delta
        //      data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Hello"}}
        //      event: message_stop
        //      data: {"type": "message_stop"}
        switch (sse.event) {
            case 'content_block_delta':
                try {
                    return { data: JSON.parse(sse.data || '') };
                } catch (e) {
                    console.error(e, sse.data);
                    return {};
                }
            case 'message_start':
            case 'content_block_start':
            case 'content_block_stop':
                return {};
            case 'message_stop':
                return { finish: true };
            default:
                return {};
        }
    }

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> => {
        const { message, images, prompt, history } = params;
        const url = `${context.ANTHROPIC_API_BASE}/messages`;
        const header = {
            'x-api-key': context.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        };

        const messages: HistoryItem[] = (history || []).concat({ role: 'user', content: message, images });

        if (messages.length > 0 && messages[0].role === 'assistant') {
            messages.shift();
        }

        const body = {
            system: prompt,
            model: context.ANTHROPIC_CHAT_MODEL,
            messages: await Promise.all(messages.map(item => this.render(item))),
            stream: onStream != null,
            max_tokens: ENV.MAX_TOKEN_LENGTH > 0 ? ENV.MAX_TOKEN_LENGTH : 2048,
        };
        if (!body.system) {
            delete body.system;
        }

        const options: SseChatCompatibleOptions = {};
        options.streamBuilder = function (r, c) {
            return new Stream(r, c, Anthropic.parser);
        };
        options.contentExtractor = function (data: any) {
            return data?.delta?.text;
        };
        options.fullContentExtractor = function (data: any) {
            return data?.content?.[0].text;
        };
        options.errorExtractor = function (data: any) {
            return data?.error?.message;
        };
        return requestChatCompletions(url, header, body, onStream, null, options);
    };
}
