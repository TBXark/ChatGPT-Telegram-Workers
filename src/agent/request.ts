import type { ChatStreamTextHandler } from './types';
import { ENV } from '../config/env';
import { Stream } from './stream';

export interface SseChatCompatibleOptions {
    streamBuilder?: (resp: Response, controller: AbortController) => Stream;
    contentExtractor?: (data: object) => string | null;
    fullContentExtractor?: (data: object) => string | null;
    errorExtractor?: (data: object) => string | null;
}

function fixOpenAICompatibleOptions(options: SseChatCompatibleOptions | null): SseChatCompatibleOptions {
    options = options || {};
    options.streamBuilder = options.streamBuilder || function (r, c) {
        return new Stream(r, c);
    };
    options.contentExtractor = options.contentExtractor || function (d: any) {
        return d?.choices?.at(0)?.delta?.content;
    };
    options.fullContentExtractor = options.fullContentExtractor || function (d: any) {
        return d.choices?.at(0)?.message.content;
    };
    options.errorExtractor = options.errorExtractor || function (d: any) {
        return d.error?.message;
    };
    return options;
}

export function isJsonResponse(resp: Response): boolean {
    return resp.headers.get('content-type')?.includes('json') || false;
}

export function isEventStreamResponse(resp: Response): boolean {
    const types = ['application/stream+json', 'text/event-stream'];
    const content = resp.headers.get('content-type') || '';
    for (const type of types) {
        if (content.includes(type)) {
            return true;
        }
    }
    return false;
}

export async function streamHandler<T>(stream: AsyncIterable<T>, contentExtractor: (data: T) => string | null, onStream: (text: string) => Promise<any>): Promise<string> {
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 50;
    let lastUpdateTime = Date.now();
    try {
        for await (const part of stream) {
            const textPart = contentExtractor(part);
            if (!textPart) {
                continue;
            }
            lengthDelta += textPart.length;
            contentFull = contentFull + textPart;
            if (lengthDelta > updateStep) {
                if (ENV.TELEGRAM_MIN_STREAM_INTERVAL > 0) {
                    const delta = Date.now() - lastUpdateTime;
                    if (delta < ENV.TELEGRAM_MIN_STREAM_INTERVAL) {
                        continue;
                    }
                    lastUpdateTime = Date.now();
                }
                lengthDelta = 0;
                updateStep += 20;
                await onStream(`${contentFull}\n...`);
            }
        }
    } catch (e) {
        contentFull += `\nError: ${(e as Error).message}`;
    }
    return contentFull;
}

export async function requestChatCompletions(url: string, header: Record<string, string>, body: any, onStream: ChatStreamTextHandler | null, options: SseChatCompatibleOptions | null = null): Promise<string> {
    const controller = new AbortController();
    const { signal } = controller;

    let timeoutID = null;
    if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
        timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT);
    }

    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
        signal,
    });
    if (timeoutID) {
        clearTimeout(timeoutID);
    }

    options = fixOpenAICompatibleOptions(options);
    if (onStream && resp.ok && isEventStreamResponse(resp)) {
        const stream = options.streamBuilder?.(resp, controller);
        if (!stream) {
            throw new Error('Stream builder error');
        }
        return streamHandler<object>(stream, options.contentExtractor!, onStream);
    }
    if (!isJsonResponse(resp)) {
        throw new Error(resp.statusText);
    }

    const result = await resp.json() as any;
    if (!result) {
        throw new Error('Empty response');
    }
    if (options.errorExtractor?.(result)) {
        throw new Error(options.errorExtractor?.(result) || 'Unknown error');
    }

    return options.fullContentExtractor?.(result) || '';
}
