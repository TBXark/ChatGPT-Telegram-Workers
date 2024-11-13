import type { ChatAgentResponse, HistoryItem, ImageContent } from './types';

export interface ImageRealContent {
    url?: string;
    base64?: string;
}

export function extractTextContent(history: HistoryItem): string {
    if (typeof history.content === 'string') {
        return history.content;
    }
    if (Array.isArray(history.content)) {
        return history.content.map((item) => {
            if (item.type === 'text') {
                return item.text;
            }
            return '';
        }).join('');
    }
    return '';
}

export function extractImageContent(imageData: ImageContent): ImageRealContent {
    if (imageData instanceof URL) {
        return { url: imageData.href };
    }
    // 2. 判断 DataContent 的具体类型
    // 检查是否为字符串（包括 base64）
    if (typeof imageData === 'string') {
        if (imageData.startsWith('http')) {
            return { url: imageData };
        } else {
            return { base64: imageData };
        }
    }
    if (imageData instanceof Uint8Array) {
        return { base64: Buffer.from(imageData).toString('base64') };
    }
    if (Buffer.isBuffer(imageData)) {
        return { base64: Buffer.from(imageData).toString('base64') };
    }
    return {};
}

export async function convertStringToResponseMessages(input: Promise<string>): Promise<ChatAgentResponse> {
    const text = await input;
    return {
        text,
        responses: [{ role: 'assistant', content: await input }],
    };
}

export type RemoteParser = (url: string) => Promise<string[]>;
export async function loadModelsList(raw: string, remoteLoader?: RemoteParser): Promise<string[]> {
    if (!raw) {
        return [];
    }
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    if (raw.startsWith('http') && remoteLoader) {
        return await remoteLoader(raw);
    }
    return [];
}
