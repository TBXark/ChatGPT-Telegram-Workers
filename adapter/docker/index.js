/* eslint-disable require-jsdoc */
import adapter from 'cloudflare-worker-adapter';
import { RedisCache } from 'cloudflare-worker-adapter/cache/redis.js';
// import fs from 'fs';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const cache = new RedisCache(redisUrl);

// 配置版本信息
// try {
//     const buildInfo = JSON.parse(fs.readFileSync('../../dist/buildinfo.json', 'utf-8'));
//     process.env.BUILD_TIMESTAMP = buildInfo.timestamp;
//     process.env.BUILD_VERSION = buildInfo.sha;
//     console.log(buildInfo);
// } catch (e) {
//     console.log(e);
// }
console.log(process.env);

const {default: worker} = await import('chatgpt-telegram-workers');

adapter.startServer(
    8787,
    'localhost',
    './config/config.toml',
    {DATABASE: cache},
    {server: process.env.DOMAIN},
    worker.fetch,
);
