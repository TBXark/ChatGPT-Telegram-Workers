import type { HistoryItem } from '#/agent/types';
import { extractImageContent, loadModelsList } from '#/agent/utils';
import { ENV } from '#/config';
import { imageToBase64String, renderBase64DataURI } from '#/utils/image';

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

export function loadOpenAIModelList(list: string, base: string, headers: Record<string, string>): Promise<string[]> {
    if (list === '') {
        list = `${base}/models`;
    }
    return loadModelsList(list, async (url): Promise<string[]> => {
        const data = await fetch(url, { headers }).then(res => res.json()) as any;
        return data.data?.map((model: any) => model.id) || [];
    });
}
