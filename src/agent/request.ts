import type { ChatStreamTextHandler, CompletionData, OpenAIFuncCallData } from './types';
import { ENV } from '../config/env';
import { Stream } from './stream';

export interface SseChatCompatibleOptions {
    streamBuilder?: (resp: Response, controller: AbortController) => Stream;
    contentExtractor?: (data: object) => string | null;
    fullContentExtractor?: (data: object) => string | null;
    functionCallExtractor?: (data: object, call_list: any[]) => void;
    fullFunctionCallExtractor?: (data: object) => OpenAIFuncCallData[] | null;
    errorExtractor?: (data: object) => string | null;
}

function fixOpenAICompatibleOptions(options: SseChatCompatibleOptions | null): SseChatCompatibleOptions {
    options = options || {};
    options.streamBuilder = options.streamBuilder || function (r, c) {
        return new Stream(r, c);
    };
    options.contentExtractor = options.contentExtractor || function (d: any) {
        return d?.choices?.[0]?.delta?.content;
    };
    options.fullContentExtractor = options.fullContentExtractor || function (d: any) {
        return d.choices?.[0]?.message.content;
    };
    options.functionCallExtractor
    = options.functionCallExtractor
    || function (d: any, call_list: OpenAIFuncCallData[]) {
        const chunck = d?.choices?.[0]?.delta?.tool_calls;
        if (!Array.isArray(chunck))
            return;
        for (const a of chunck) {
            if (!Object.hasOwn(a, 'index')) {
                throw new Error(`The function chunck don't have index: ${JSON.stringify(chunck)}`);
            }
            if (a?.type === 'function') {
                call_list[a.index] = { id: a.id, type: a.type, function: a.function };
            } else {
                call_list[a.index].function.arguments += a.function.arguments;
            }
        }
    };
    options.fullFunctionCallExtractor
    = options.fullFunctionCallExtractor
    || function (d: any) {
        return d?.choices?.[0]?.message?.tool_calls;
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

export async function requestChatCompletions(url: string, header: Record<string, string>, body: any, onStream: ChatStreamTextHandler | null, onResult: ChatStreamTextHandler | null = null, options: SseChatCompatibleOptions | null = null): Promise<string | CompletionData> {
    const controller = new AbortController();
    const { signal } = controller;

    let timeoutID = null;
    let lastUpdateTime = Date.now();
    if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
        timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT * 1e3);
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
        let contentFull = '';
        let lengthDelta = 0;
        let updateStep = 50;
        let needSendCallMsg = true;
        const tool_calls: OpenAIFuncCallData[] = [];
        try {
            for await (const data of stream) {
                const c = options.contentExtractor?.(data) || '';
                if (body?.tools?.length > 0)
                    options.functionCallExtractor?.(data, tool_calls);
                if (c === '' && tool_calls.length === 0)
                    continue;
                if (tool_calls.length > 0) {
                    if (needSendCallMsg) {
                        await onStream(`Start function call.`);
                        needSendCallMsg = false;
                    }
                    continue;
                }
                lengthDelta += c.length;
                contentFull = contentFull + c;
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
            contentFull += `\nERROR: ${(e as Error).message}`;
        }
        if (tool_calls.length > 0) {
            return {
                content: contentFull,
                tool_calls,
            };
        } else {
            return contentFull;
        }
    }

    if (!isJsonResponse(resp)) {
        throw new Error(resp.statusText);
    }

    const result = await resp.json();

    if (!result) {
        throw new Error('Empty response');
    }

    if (options.errorExtractor?.(result)) {
        throw new Error(options.errorExtractor?.(result) || 'Unknown error');
    }

    try {
        await onResult?.(result);
        const content = options.fullContentExtractor?.(result) || '';
        const tool_calls = options.fullFunctionCallExtractor?.(result) || [];
        return tool_calls.length > 0
            ? {
                    content,
                    tool_calls,
                }
            : content;
    } catch (e) {
        console.error(e);
        throw new Error(JSON.stringify(result));
    }
}
