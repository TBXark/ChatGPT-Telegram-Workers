import fs from 'node:fs';
import adapter, { bindGlobal } from 'cloudflare-worker-adapter';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import { createCache } from 'cloudflare-worker-adapter/cache';
import worker from '../../main.js';
import { ENV } from '../../src/config/env.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const cache = await createCache(config?.database?.type, config?.database);
console.log(`database: ${config?.database?.type} is ready`);

// 配置代理
const proxy = config?.https_proxy || process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
    console.log(`https proxy: ${proxy}`);
    const agent = new HttpsProxyAgent(proxy);
    const proxyFetch = async (url, init) => {
        return fetch(url, { agent, ...init });
    };
    bindGlobal({
        fetch: proxyFetch,
    });
}

// 配置版本信息
try {
    const buildInfo = JSON.parse(fs.readFileSync('../../dist/buildinfo.json', 'utf-8'));
    ENV.BUILD_TIMESTAMP = buildInfo.timestamp;
    ENV.BUILD_VERSION = buildInfo.sha;
    console.log(buildInfo);
} catch (e) {
    console.log(e);
}

// 延迟加载 ../main.js， 防止ENV过早初始化
adapter.startServer(
    config.port || 8787,
    config.host || '0.0.0.0',
    '../../wrangler.toml',
    { DATABASE: cache },
    { server: config.server },
    worker.fetch,
);
