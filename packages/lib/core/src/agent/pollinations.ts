import type { AgentUserConfig } from '../config';
import type {
  ImageAgent
} from './types';


class PollinationsBase {
    readonly name = 'pollinations';
    readonly modelFromURI = (uri: string | null): string => {
        if (!uri) {
            return '';
        }
        try {
            const model = new URL(uri).searchParams.get('model');
            if (model) {
                return model;
            }
            throw new Error('Invalid URI');
        } catch {
            return uri;
        }
    };
}

export class PollinationsImageAI extends PollinationsBase implements ImageAgent {
    readonly modelKey = 'POLLINATIONS_IMAGE_API';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.POLLINATIONS_IMAGE_API);
    };

    readonly model = (ctx: AgentUserConfig) => {
        return this.modelFromURI(ctx.POLLINATIONS_IMAGE_API);
    };

    readonly request = async (prompt: string, context: AgentUserConfig): Promise<Blob> => {
        const header = {
            'Content-Type': 'application/json',
        };
        const params = new URLSearchParams({
            width: context.POLLINATIONS_IMAGE_WIDTH.toString(),
            height: context.POLLINATIONS_IMAGE_HEIGHT.toString(),
            model: context.POLLINATIONS_IMAGE_MODEL,
            nologo: context.POLLINATIONS_IMAGE_NOLOGO,
            private: context.POLLINATIONS_IMAGE_PRIVATE,
            enhance: context.POLLINATIONS_IMAGE_ENHANCE,
        });
        const url = `${context.POLLINATIONS_API_BASE}/p/${encodeURIComponent(prompt)}?${params.toString()}`;
        const resp = await fetch(url, {
            method: 'GET',
            headers: header,
        }) as Response;

        return await resp.blob();
    };
}
