import fs from 'node:fs';
import * as process from 'node:process';
import { createCache, startServer } from 'cloudflare-worker-adapter';
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import { installFetchProxy } from 'cloudflare-worker-adapter/fetchProxy';
import worker from '../../main';
import { ENV } from '../../src/config/env.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const cache = createCache(config?.database?.type, config?.database);
console.log(`database: ${config?.database?.type} is ready`);

// 配置代理
const proxy = config?.https_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
if (proxy) {
    installFetchProxy(proxy);
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

startServer(
    config.port || 8787,
    config.host || '0.0.0.0',
    '../../wrangler.toml',
    { DATABASE: cache },
    { baseURL: config.server },
    worker.fetch,
);
