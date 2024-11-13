import type { GetUpdatesResponse } from 'telegram-bot-api-types';
import type { TelegramBotAPI } from '../../telegram/api';
import * as fs from 'node:fs';
import { createCache } from 'cloudflare-worker-adapter/cache';
import { installFetchProxy } from 'cloudflare-worker-adapter/proxy';
import { defaultRequestBuilder, initEnv, startServerV2 } from 'cloudflare-worker-adapter/serve';
import { CHAT_AGENTS } from '../../agent';
import { injectNextChatAgent } from '../../agent/next/next';
import { ENV } from '../../config/env';
import { createRouter } from '../../route';
import { createTelegramBotAPI } from '../../telegram/api';
import { handleUpdate } from '../../telegram/handler';

const {
    CONFIG_PATH = '/app/config.json',
    TOML_PATH = '/app/wrangler.toml',
    NEXT_ENABLE = '0',
} = process.env;

interface Config {
    database: {
        type: 'memory' | 'local' | 'sqlite' | 'redis';
        path?: string;
    };
    server?: {
        hostname?: string;
        port?: number;
        baseURL: string;
    };
    proxy?: string;
    mode: 'webhook' | 'polling';
}

// 读取配置文件
const config: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

if (config.proxy) {
    installFetchProxy(config.proxy);
}

// 初始化数据库
const cache = createCache(config?.database?.type, {
    uri: config.database.path || '',
});
console.log(`database: ${config?.database?.type} is ready`);

// 初始化环境变量
const env = initEnv(TOML_PATH, { DATABASE: cache });
ENV.merge(env);

// long polling 模式
async function runPolling() {
    const clients: Record<string, TelegramBotAPI> = {};
    const offset: Record<string, number> = {};
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        offset[token] = 0;
        const api = createTelegramBotAPI(token);
        clients[token] = api;
        const name = await api.getMeWithReturns();
        await api.deleteWebhook({});
        console.log(`@${name.result.username} Webhook deleted, If you want to use webhook, please set it up again.`);
    }

    const keepRunning = true;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (keepRunning) {
        for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
            try {
                const resp = await clients[token].getUpdates({ offset: offset[token] });
                if (resp.status === 429) {
                    const retryAfter = Number.parseInt(resp.headers.get('Retry-After') || '');
                    if (retryAfter) {
                        console.log(`Rate limited, retry after ${retryAfter} seconds`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                        continue;
                    }
                }
                const { result } = await resp.json() as GetUpdatesResponse;
                for (const update of result) {
                    if (update.update_id >= offset[token]) {
                        offset[token] = update.update_id + 1;
                    }
                    setImmediate(async () => {
                        await handleUpdate(token, update).catch(console.error);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

if (NEXT_ENABLE) {
    injectNextChatAgent(CHAT_AGENTS);
}

// 启动服务
if (config.mode === 'webhook' && config.server !== undefined) {
    const router = createRouter();
    startServerV2(
        config.server.port || 8787,
        config.server.hostname || '0.0.0.0',
        env,
        { baseURL: config.server.baseURL },
        defaultRequestBuilder,
        router.fetch,
    );
} else {
    runPolling().catch(console.error);
}
