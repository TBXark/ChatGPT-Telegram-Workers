import main from '../main.js'
import {  startServer, MemoryCache  } from 'cloudflare-worker-adapter';
import { ENV } from './test-env.js'; // 本地测试环境变量,不会提交到git, 请自行创建

const env = { 
    DATABASE: new MemoryCache(),
    API_KEY: "sk-",
    TELEGRAM_AVAILABLE_TOKENS: "",
    // 本地调试使用 cloudflared 将端口映射到外网, 然后将临时域名写到  WORKERS_DOMAIN
    // cloudflared tunnel --url localhost:3000
    WORKERS_DOMAIN: "xxx.xxx.workers.dev",
    CHAT_WHITE_LIST: "",
    ...ENV
  }


addEventListener('fetch', (event) => {
    event.respondWith(main.fetch(event.request, env))
});

startServer();