import { imageToBase64String } from '../utils/image';
import { ENV } from '../config/env';
import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import { Stream, anthropicSseJsonParser } from './stream';
import type { SseChatCompatibleOptions } from './request';
import { requestChatCompletions } from './request';

export class Anthropic implements ChatAgent {
    readonly name = 'anthropic';
    readonly modelKey = 'ANTHROPIC_CHAT_MODEL';

    enable(context: AgentUserConfig): boolean {
        return !!(context.ANTHROPIC_API_KEY);
    }

    private async render(item: HistoryItem): Promise<any> {
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
    }

    async request(params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> {
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
            return new Stream(r, c, anthropicSseJsonParser);
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
    }

    model(ctx: AgentUserConfig) {
        return ctx.ANTHROPIC_CHAT_MODEL;
    }
}
