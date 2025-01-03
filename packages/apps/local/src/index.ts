import * as fs from 'node:fs';
import * as process from "node:process";
import { CHAT_AGENTS, createRouter, ENV, handleUpdate } from '@chatgpt-telegram-workers/core';
import { injectNextChatAgent } from '@chatgpt-telegram-workers/next';
import { createCache, defaultRequestBuilder, initEnv, installFetchProxy, startServerV2 } from 'cloudflare-worker-adapter';
import { runPolling } from './telegram';

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

const {
    CONFIG_PATH = '/app/config.json',
    TOML_PATH = '/app/wrangler.toml',
    NEXT_ENABLE = '0',
} = process.env;

// 读取配置文件
const config: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// 初始化数据库
const cache = createCache(config?.database?.type, { uri: config.database.path || '' });
console.log(`database: ${config?.database?.type} is ready`);

// 初始化环境变量
const env = initEnv(TOML_PATH, { DATABASE: cache });
ENV.merge(env);

// 注入 Next.js Chat Agent
if (NEXT_ENABLE !== '0') {
    injectNextChatAgent(CHAT_AGENTS);
}
if (config.proxy) {
    installFetchProxy(config.proxy);
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
    runPolling(
        ENV.TELEGRAM_AVAILABLE_TOKENS,
        handleUpdate,
    ).catch(console.error);
}
