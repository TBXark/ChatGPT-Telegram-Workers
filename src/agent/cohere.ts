import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, HistoryItem, LlmParams, SseChatCompatibleOptions } from './types';
import { Stream, cohereSseJsonParser } from './stream.js';
import { requestChatCompletions } from './request.js';

/**
 * @param {WorkerContext} context
 * @returns {boolean}
 */
export function isCohereAIEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.COHERE_API_KEY);
}

const COHERE_ROLE_MAP = {
    assistant: 'CHATBOT',
    user: 'USER',
};

function renderCohereMessage(item: HistoryItem): any {
    return {
        role: COHERE_ROLE_MAP[item.role],
        content: item.content,
    };
}

export async function requestCompletionsFromCohereAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
    const header = {
        'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
    };

    const body = {
        message,
        model: context.USER_CONFIG.COHERE_CHAT_MODEL,
        stream: onStream != null,
        preamble: prompt,
        chat_history: history.map(renderCohereMessage),
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
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}
