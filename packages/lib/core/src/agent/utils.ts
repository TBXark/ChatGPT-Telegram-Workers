import type { AgentUserConfig } from '#/config';
import type { ChatAgentResponse, DataItemContent, HistoryItem } from './types';

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

export function extractImageContent(imageData: DataItemContent | URL): ImageRealContent {
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
    if (typeof Buffer !== 'undefined') {
        if (imageData instanceof Uint8Array) {
            return { base64: Buffer.from(imageData).toString('base64') };
        }
        if (Buffer.isBuffer(imageData)) {
            return { base64: Buffer.from(imageData).toString('base64') };
        }
    }
    return {};
}

export async function convertStringToResponseMessages(input: Promise<string> | string): Promise<ChatAgentResponse> {
    const text = typeof input === 'string' ? input : await input;
    return {
        text,
        responses: [{ role: 'assistant', content: text }],
    };
}

export async function loadModelsList(raw: string, remoteLoader?: (url: string) => Promise<string[]>): Promise<string[]> {
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
    return [raw];
}

export function bearerHeader(token: string | null, stream?: boolean): Record<string, string> {
    const res: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    if (stream !== undefined) {
        res.Accept = stream ? 'text/event-stream' : 'application/json';
    }
    return res;
}

type WorkersConfigKeys = keyof AgentUserConfig;
export function getAgentUserConfigFieldName<T extends WorkersConfigKeys>(fieldName: T): T {
    return fieldName;
}
