import adapter from 'cloudflare-worker-adapter';
import {default as worker} from 'chatgpt-telegram-workers';
import fs from 'fs';
import {createCache} from "cloudflare-worker-adapter/cache";


const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const cache = await createCache(config?.database?.type, config?.database)
console.log(`database: ${config?.database?.type} is ready`);

adapter.startServer(
    8787,
    '127.0.0.1',
    './config/config.toml',
    {DATABASE: cache},
    {server: config.server},
    worker.fetch,
);
