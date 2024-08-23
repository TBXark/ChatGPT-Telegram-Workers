import { imageToBase64String } from '../utils/image';
import { ENV } from '../config/env';
import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, HistoryItem, LlmParams, SseChatCompatibleOptions } from './types';
import { Stream, anthropicSseJsonParser } from './stream';
import { requestChatCompletions } from './request';

/**
 * @param {WorkerContext} context
 * @returns {boolean}
 */
export function isAnthropicAIEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.ANTHROPIC_API_KEY);
}

async function renderAnthropicMessage(item: HistoryItem): Promise<any> {
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

export async function requestCompletionsFromAnthropicAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, images, prompt, history } = params;
    const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
    const header = {
        'x-api-key': context.USER_CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    };

    const messages = ([...(history || []), { role: 'user', content: message, images }]);

    if (messages.length > 0 && messages[0].role === 'assistant') {
        messages.shift();
    }

    const body = {
        system: prompt,
        model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
        messages: await Promise.all(messages.map(renderAnthropicMessage)),
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
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}
