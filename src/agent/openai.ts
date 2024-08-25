import { ENV } from '../config/share';
import { imageToBase64String, renderBase64DataURI } from '../utils/image';
import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, ImageAgent, LLMChatParams } from './types';
import { requestChatCompletions } from './request';

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

class OpenAIBase {
    readonly name = 'openai';
    apikey = (context: AgentUserConfig): string => {
        const length = context.OPENAI_API_KEY.length;
        return context.OPENAI_API_KEY[Math.floor(Math.random() * length)];
    };
}

export class OpenAI extends OpenAIBase implements ChatAgent {
    readonly modelKey = 'OPENAI_API_KEY';

    readonly enable = (context: AgentUserConfig): boolean => {
        return context.OPENAI_API_KEY.length > 0;
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.OPENAI_CHAT_MODEL;
    };

    private render = async (item: HistoryItem): Promise<any> => {
        return renderOpenAIMessage(item);
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> => {
        const { message, images, prompt, history } = params;
        const url = `${context.OPENAI_API_BASE}/chat/completions`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apikey(context)}`,
        };

        const messages = [...(history || []), { role: 'user', content: message, images }];
        if (prompt) {
            messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
        }

        const body = {
            model: context.OPENAI_CHAT_MODEL,
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await Promise.all(messages.map(this.render)),
            stream: onStream != null,
        };

        return requestChatCompletions(url, header, body, onStream);
    };
}

export class Dalle extends OpenAIBase implements ImageAgent {
    readonly modelKey = 'OPENAI_DALLE_API';

    enable = (context: AgentUserConfig): boolean => {
        return context.OPENAI_API_KEY.length > 0;
    };

    model = (ctx: AgentUserConfig): string => {
        return ctx.DALL_E_MODEL;
    };

    request = async (prompt: string, context: AgentUserConfig): Promise<string> => {
        const url = `${context.OPENAI_API_BASE}/images/generations`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apikey(context)}`,
        };
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
        return resp?.data?.[0]?.url;
    };
}
