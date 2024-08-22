import { ENV } from '../config/env.js';

import { imageToBase64String, renderBase64DataURI } from '../utils/image.js';
import type { WorkerContext } from '../config/context';
import type { AgentTextHandler, HistoryItem, LlmParams } from './types';
import { requestChatCompletions } from './request.js';

function openAIKeyFromContext(context: WorkerContext): string {
    const length = context.USER_CONFIG.OPENAI_API_KEY.length;
    return context.USER_CONFIG.OPENAI_API_KEY[Math.floor(Math.random() * length)];
}

export function isOpenAIEnable(context: WorkerContext): boolean {
    return context.USER_CONFIG.OPENAI_API_KEY.length > 0;
}

export async function renderOpenAIMessage(item: HistoryItem): Promise<any> {
    const res: any = {
        role: item.role,
        content: item.content,
    };
    if (item.images && item.images.length > 0) {
        res.content = [];
        if (item.content) {
            res.content.push({ type: 'text', text: item.content });
        }
        for (const image of item.images) {
            switch (ENV.TELEGRAM_IMAGE_TRANSFER_MODE) {
                case 'base64':
                    res.content.push({ type: 'image_url', image_url: {
                        url: renderBase64DataURI(await imageToBase64String(image)),
                    } });
                    break;
                case 'url':
                default:
                    res.content.push({ type: 'image_url', image_url: { url: image } });
                    break;
            }
        }
    }
    return res;
}

export async function requestCompletionsFromOpenAI(params: LlmParams, context: WorkerContext, onStream: AgentTextHandler): Promise<string> {
    const { message, images, prompt, history } = params;
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };

    const messages = [...(history || []), { role: 'user', content: message, images }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }

    const body = {
        model: context.USER_CONFIG.OPENAI_CHAT_MODEL,
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: await Promise.all(messages.map(renderOpenAIMessage)),
        stream: onStream != null,
    };

    return requestChatCompletions(url, header, body, context, onStream);
}

export async function requestImageFromOpenAI(prompt: string, context: WorkerContext): Promise<string> {
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/images/generations`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };
    const body: any = {
        prompt,
        n: 1,
        size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
        model: context.USER_CONFIG.DALL_E_MODEL,
    };
    if (body.model === 'dall-e-3') {
        body.quality = context.USER_CONFIG.DALL_E_IMAGE_QUALITY;
        body.style = context.USER_CONFIG.DALL_E_IMAGE_STYLE;
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
