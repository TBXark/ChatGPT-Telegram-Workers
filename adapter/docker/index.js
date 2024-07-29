import adapter from 'cloudflare-worker-adapter';
import {MemoryCache} from 'cloudflare-worker-adapter/cache/memory.js';
import {default as worker} from '../../main.js';
import fs from 'fs';


const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));

// 配置数据库
let cache;
switch (config?.database?.type) {
  case 'local':
    // eslint-disable-next-line no-case-declarations
    const {LocalCache} = await import('cloudflare-worker-adapter/cache/local.js');
    cache = new LocalCache(config.database.uri);
    break;
  case 'sqlite':
    // eslint-disable-next-line no-case-declarations
    const {SqliteCache} = await import('cloudflare-worker-adapter/cache/sqlite.js');
    cache = new SqliteCache(config.database.uri);
    break;
  case 'redis':
    // eslint-disable-next-line no-case-declarations
    const {RedisCache} = await import('cloudflare-worker-adapter/cache/redis.js');
    cache = new RedisCache(config.database.uri);
    break;
  default:
    // eslint-disable-next-line no-case-declarations
    const {MemoryCache} = await import('cloudflare-worker-adapter/cache/memory.js');
    cache = new MemoryCache();
    break;
}

console.log(`database: ${config?.database?.type} is ready`);

adapter.startServer(
    8787,
    '127.0.0.1',
    './config/config.toml',
    {DATABASE: cache},
    {server: config.server},
    worker.fetch,
);
