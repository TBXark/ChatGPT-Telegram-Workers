import type { AgentUserConfig } from '../config/env';
import type {
    ChatAgent,
    ChatAgentResponse,
    ChatStreamTextHandler,
    HistoryItem,
    ImageAgent,
    LLMChatParams,
} from './types';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, extractImageContent, loadModelsList } from './utils';

async function renderOpenAIMessage(item: HistoryItem, supportImage?: boolean): Promise<any> {
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
                        const data = extractImageContent(content.image);
                        if (data.url) {
                            contents.push({ type: 'image_url', image_url: { url: data.url } });
                        } else if (data.base64) {
                            contents.push({ type: 'image_url', image_url: { url: data.base64 } });
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

export async function renderOpenAIMessages(prompt: string | undefined, items: HistoryItem[], supportImage?: boolean): Promise<any[]> {
    const messages = await Promise.all(items.map(r => renderOpenAIMessage(r, supportImage)));
    if (prompt) {
        if (messages.length > 0 && messages[0].role === 'system') {
            messages.shift();
        }
        messages.unshift({ role: 'system', content: prompt });
    }
    return messages;
}

class OpenAIBase {
    readonly name = 'openai';
    apikey = (context: AgentUserConfig): string => {
        const length = context.OPENAI_API_KEY.length;
        return context.OPENAI_API_KEY[Math.floor(Math.random() * length)];
    };
}

export class OpenAI extends OpenAIBase implements ChatAgent {
    readonly modelKey = 'OPENAI_CHAT_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return context.OPENAI_API_KEY.length > 0;
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
        return ctx.OPENAI_CHAT_MODEL;
    };

    private render = async (item: HistoryItem): Promise<any> => {
        return renderOpenAIMessage(item);
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.OPENAI_API_BASE}/chat/completions`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apikey(context)}`,
        };
        const body = {
            model: context.OPENAI_CHAT_MODEL,
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await renderOpenAIMessages(prompt, messages, true),
            stream: onStream != null,
        };

        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.OPENAI_CHAT_MODELS_LIST === '') {
            context.OPENAI_CHAT_MODELS_LIST = `${context.OPENAI_API_BASE}/models`;
        }
        return loadModelsList(context.OPENAI_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(url, {
                headers: { Authorization: `Bearer ${this.apikey(context)}` },
            }).then(res => res.json());
            return data.data?.map((model: any) => model.id) || [];
        });
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
        return resp?.data?.at(0)?.url;
    };
}
