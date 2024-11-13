import type { AgentUserConfig } from '../config/env';
import type { SseChatCompatibleOptions } from './request';
import type { SSEMessage, SSEParserResult } from './stream';
import type {
    ChatAgent,
    ChatAgentResponse,
    ChatStreamTextHandler,
    HistoryItem,
    LLMChatParams,
} from './types';
import { ENV } from '../config/env';
import { imageToBase64String } from '../utils/image';
import { requestChatCompletions } from './request';
import { Stream } from './stream';
import { convertStringToResponseMessages, extractImageContent, loadModelsList } from './utils';

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
        if (item.role === 'system') {
            return null;
        }
        if (Array.isArray(item.content)) {
            const contents = [];
            for (const content of item.content) {
                switch (content.type) {
                    case 'text':
                        contents.push({ type: 'text', text: content.text });
                        break;
                    case 'image': {
                        const data = extractImageContent(content.image);
                        if (data.url) {
                            contents.push(await imageToBase64String(data.url).then(({ format, data }) => {
                                return { type: 'image', source: { type: 'base64', media_type: format, data } };
                            }));
                        } else if (data.base64) {
                            contents.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: data.base64 } });
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
            res.content = contents;
        }
        return res;
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
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

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.ANTHROPIC_API_BASE}/messages`;
        const header = {
            'x-api-key': context.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        };

        if (messages.length > 0 && messages[0].role === 'assistant') {
            messages.shift();
        }

        const body = {
            system: prompt,
            model: context.ANTHROPIC_CHAT_MODEL,
            messages: (await Promise.all(messages.map(item => this.render(item)))).filter(i => i !== null),
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
            return data?.content?.at(0).text;
        };
        options.errorExtractor = function (data: any) {
            return data?.error?.message;
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, options));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        return loadModelsList(context.ANTHROPIC_CHAT_MODELS_LIST);
    };
}
