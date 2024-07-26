import adapter from 'cloudflare-worker-adapter';
import {MemoryCache} from 'cloudflare-worker-adapter/cache/memory.js';
import {default as worker} from '../../main.js';


const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));

// 配置数据库
let cache = new MemoryCache();
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

const proxy = config.https_proxy || process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
  console.log(`https proxy: ${proxy}`);
  const agent = new HttpsProxyAgent(proxy);
  const proxyFetch = async (url, init) => {
    return fetch(url, {agent, ...init});
  };
  bindGlobal({
    fetch: proxyFetch,
  });
}


adapter.startServer(
    8787,
    '127.0.0.1',
    './config/config.toml',
    {DATABASE: cache},
    {server: config.server},
    worker.fetch,
);
