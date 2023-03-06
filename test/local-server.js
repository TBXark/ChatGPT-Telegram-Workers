import main from '../main.js'
import {  startServer, MemoryCache  } from 'cloudflare-worker-adapter';

const env = { 
    DATABASE: new MemoryCache(),
    API_KEY: "sk-",
    TELEGRAM_AVAILABLE_TOKENS: "",
    WORKERS_DOMAIN: "xxx.xxx.workers.dev",
    CHAT_WHITE_LIST: ""
  }


addEventListener('fetch', (event) => {
    event.respondWith(main.fetch(event.request, env))
});

startServer();