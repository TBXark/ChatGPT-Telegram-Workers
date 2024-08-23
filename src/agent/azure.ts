import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, LlmParams } from './types';
import { requestChatCompletions } from './request';
import { renderOpenAIMessage } from './openai';

function azureKeyFromContext(context: WorkerContext): string | null {
    return context.USER_CONFIG.AZURE_API_KEY;
}

export function isAzureEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_COMPLETIONS_API);
}

export function isAzureImageEnable(context: WorkerContext): boolean {
    return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_DALLE_API);
}

export async function requestCompletionsFromAzureOpenAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, images, prompt, history } = params;
    const url = context.USER_CONFIG.AZURE_COMPLETIONS_API;
    const header = {
        'Content-Type': 'application/json',
        'api-key': azureKeyFromContext(context),
    };

    const messages = [...(history || []), { role: 'user', content: message, images }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }

    const body = {
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: await Promise.all(messages.map(renderOpenAIMessage)),
        stream: onStream != null,
    };

    return requestChatCompletions(url, header, body, context, onStream);
}

export async function requestImageFromAzureOpenAI(prompt: string, context: WorkerContext): Promise<string> {
    const url = context.USER_CONFIG.AZURE_DALLE_API;
    const header = {
        'Content-Type': 'application/json',
        'api-key': azureKeyFromContext(context),
    };
    const body = {
        prompt,
        n: 1,
        size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
        style: context.USER_CONFIG.DALL_E_IMAGE_STYLE,
        quality: context.USER_CONFIG.DALL_E_IMAGE_QUALITY,
    };
    const validSize = ['1792x1024', '1024x1024', '1024x1792'];
    if (!validSize.includes(body.size)) {
        body.size = '1024x1024';
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    }).then(res => res.json()) as any;

    if (resp.error?.message) {
        throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
}
