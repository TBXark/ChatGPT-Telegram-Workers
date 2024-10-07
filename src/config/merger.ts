import type { AgentUserConfig } from './env';

export class ConfigMerger {
    private static parseArray(raw: string): string[] {
        raw = raw.trim();
        if (raw === '') {
            return [];
        }
        if (raw.startsWith('[') && raw.endsWith(']')) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error(e);
            }
        }
        return raw.split(',');
    }

    static trim(source: AgentUserConfig, lock: string[]): Record<string, any> {
        const config: Record<string, any> = { ...source };
        const keysSet = new Set<string>(source?.DEFINE_KEYS || []);
        for (const key of lock) {
            keysSet.delete(key);
        }
        keysSet.add('DEFINE_KEYS');
        for (const key of Object.keys(config)) {
            if (!keysSet.has(key)) {
                delete config[key];
            }
        }
        return config;
    };

    static merge(target: Record<string, any>, source: Record<string, any>, exclude?: string[]) {
        const sourceKeys = new Set(Object.keys(source));
        for (const key of Object.keys(target)) {
            // 不存在的key直接跳过
            if (!sourceKeys.has(key)) {
                continue;
            }
            if (exclude && exclude.includes(key)) {
                continue;
            }
            // 默认为字符串类型
            const t = (target[key] !== null && target[key] !== undefined) ? typeof target[key] : 'string';
            // 不是字符串直接赋值
            if (typeof source[key] !== 'string') {
                target[key] = source[key];
                continue;
            }
            switch (t) {
                case 'number':
                    target[key] = Number.parseInt(source[key], 10);
                    break;
                case 'boolean':
                    target[key] = (source[key] || 'false') === 'true';
                    break;
                case 'string':
                    target[key] = source[key];
                    break;
                case 'object':
                    if (Array.isArray(target[key])) {
                        target[key] = ConfigMerger.parseArray(source[key]);
                    } else {
                        try {
                            target[key] = JSON.parse(source[key]);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    break;
                default:
                    target[key] = source[key];
                    break;
            }
        }
    }
}
