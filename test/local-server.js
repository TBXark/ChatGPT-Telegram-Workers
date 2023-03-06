import main from '../main.js'
import {  startServer, MemoryCache  } from 'cloudflare-worker-adapter';

const env = { 
    DATABASE: new MemoryCache(),
    API_KEY: "sk-",
    TELEGRAM_AVAILABLE_TOKENS: "",
    // 本地调试使用 cloudflared 将端口映射到外网, 然后将临时域名写到  WORKERS_DOMAIN
    // cloudflared tunnel --url localhost:3000
    WORKERS_DOMAIN: "xxx.xxx.workers.dev",
    CHAT_WHITE_LIST: ""
  }


addEventListener('fetch', (event) => {
    event.respondWith(main.fetch(event.request, env))
});

startServer();