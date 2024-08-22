import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, HistoryItem, LlmParams } from './types';
import { requestChatCompletions } from './request.js';

export function isMistralAIEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.MISTRAL_API_KEY);
}

function renderMistralMessage(item: HistoryItem): any {
    return {
        role: item.role,
        content: item.content,
    };
}

export async function requestCompletionsFromMistralAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.MISTRAL_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`,
    };

    const messages = [...(history || []), { role: 'user', content: message }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }

    const body = {
        model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
        messages: messages.map(renderMistralMessage),
        stream: onStream != null,
    };

    return requestChatCompletions(url, header, body, context, onStream);
}
