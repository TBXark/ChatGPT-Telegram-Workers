import type { AgentUserConfig } from '#/config';
import type {
    AgentEnable,
    AgentModel,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    HistoryItem,
    ImageAgent,
    ImageAgentRequest,
    LLMChatParams,
} from './types';
import { ENV } from '#/config';
import { imageToBase64String, renderBase64DataURI } from '#/utils/image';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, extractImageContent, loadModelsList } from './utils';

export enum ImageSupportFormat {
    URL = 'url',
    BASE64 = 'base64',
}

async function renderOpenAIMessage(item: HistoryItem, supportImage?: ImageSupportFormat[] | null): Promise<any> {
    const res: any = {
        role: item.role,
        content: item.content,
    };
    if (Array.isArray(item.content)) {
        const contents = [];
        for (const content of item.content) {
            switch (content.type) {
                case 'text':
                    contents.push({ type: 'text', text: content.text });
                    break;
                case 'image':
                    if (supportImage) {
                        const isSupportURL = supportImage.includes(ImageSupportFormat.URL);
                        const isSupportBase64 = supportImage.includes(ImageSupportFormat.BASE64);
                        const data = extractImageContent(content.image);
                        if (data.url) {
                            if (ENV.TELEGRAM_IMAGE_TRANSFER_MODE === 'base64' && isSupportBase64) {
                                contents.push(await imageToBase64String(data.url).then((data) => {
                                    return { type: 'image_url', image_url: { url: renderBase64DataURI(data) } };
                                }));
                            } else if (isSupportURL) {
                                contents.push({ type: 'image_url', image_url: { url: data.url } });
                            }
                        } else if (data.base64 && isSupportBase64) {
                            contents.push({ type: 'image_base64', image_base64: { base64: data.base64 } });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        res.content = contents;
    }
    return res;
}

export async function renderOpenAIMessages(prompt: string | undefined, items: HistoryItem[], supportImage?: ImageSupportFormat[] | null): Promise<any[]> {
    const messages = await Promise.all(items.map(r => renderOpenAIMessage(r, supportImage)));
    if (prompt) {
        if (messages.length > 0 && messages[0].role === 'system') {
            messages.shift();
        }
        messages.unshift({ role: 'system', content: prompt });
    }
    return messages;
}

function openAIApiKey(context: AgentUserConfig): string {
    const length = context.OPENAI_API_KEY.length;
    return context.OPENAI_API_KEY[Math.floor(Math.random() * length)];
}

function openAIHeaders(context: AgentUserConfig): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey(context)}`
    };
}

export class OpenAI implements ChatAgent {
    readonly name = 'openai';
    readonly modelKey = 'OPENAI_CHAT_MODEL';

    readonly enable: AgentEnable = (context: AgentUserConfig): boolean => {
        return context.OPENAI_API_KEY.length > 0;
    };

    readonly model: AgentModel = (ctx: AgentUserConfig): string | null => {
        return ctx.OPENAI_CHAT_MODEL;
    };

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.OPENAI_API_BASE}/chat/completions`;
        const header = openAIHeaders(context);
        const body = {
            model: context.OPENAI_CHAT_MODEL,
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await renderOpenAIMessages(prompt, messages, [ImageSupportFormat.URL, ImageSupportFormat.BASE64]),
            stream: onStream != null,
        };

        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, null));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.OPENAI_CHAT_MODELS_LIST === '') {
            context.OPENAI_CHAT_MODELS_LIST = `${context.OPENAI_API_BASE}/models`;
        }
        return loadModelsList(context.OPENAI_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: openAIHeaders(context),
            }).then(res => res.json()) as any;
            return data.data?.map((model: any) => model.id) || [];
        });
    };
}

export class Dalle implements ImageAgent {
    readonly name = 'openai';
    readonly modelKey = 'OPENAI_DALLE_API';

    readonly enable: AgentEnable = (context: AgentUserConfig): boolean => {
        return context.OPENAI_API_KEY.length > 0;
    };

    readonly model: AgentModel = (ctx: AgentUserConfig): string => {
        return ctx.DALL_E_MODEL;
    };

    readonly request: ImageAgentRequest = async (prompt: string, context: AgentUserConfig): Promise<string | Blob> => {
        const url = `${context.OPENAI_API_BASE}/images/generations`;
        const header = openAIHeaders(context);
        const body: any = {
            prompt,
            n: 1,
            size: context.DALL_E_IMAGE_SIZE,
            model: context.DALL_E_MODEL,
        };
        if (body.model === 'dall-e-3') {
            body.quality = context.DALL_E_IMAGE_QUALITY;
            body.style = context.DALL_E_IMAGE_STYLE;
        }
        const resp = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body),
        }).then(res => res.json()) as any;

        if (resp.error?.message) {
            throw new Error(resp.error.message);
        }
        return resp?.data?.at(0)?.url;
    };
}
