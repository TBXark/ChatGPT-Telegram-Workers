import type { WorkerContext } from '../../config/context';
import { ENV, ENV_KEY_MAPPER } from '../../config/env';
import { ConfigMerger } from '../../config/merger';

export function isTelegramChatTypeGroup(type: string): boolean {
    return type === 'group' || type === 'supergroup';
}

export async function setUserConfig(values: Record<string, any>, context: WorkerContext): Promise<void> {
    for (const ent of Object.entries(values || {})) {
        let [key, value] = ent;
        key = ENV_KEY_MAPPER[key] || key;
        if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
            throw new Error(`Key ${key} is locked`);
        }
        const configKeys = Object.keys(context.USER_CONFIG || {}) || [];
        if (!configKeys.includes(key)) {
            throw new Error(`Key ${key} is not allowed`);
        }
        context.USER_CONFIG.DEFINE_KEYS.push(key);
        ConfigMerger.merge(context.USER_CONFIG, {
            [key]: value,
        });
        console.log('Update user config: ', key, context.USER_CONFIG[key]);
    }
    context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
    await ENV.DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS)),
    );
}
