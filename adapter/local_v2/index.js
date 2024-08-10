import {ENV, initEnv} from '../../src/config/env.js';
import {deleteTelegramWebHook, getUpdates} from '../../src/telegram/telegram.js';
import i18n from '../../src/i18n/index.js';
import fs from 'node:fs';
import {handleMessage} from '../../src/telegram/message.js';
import {HttpsProxyAgent} from 'https-proxy-agent';
import fetch from 'node-fetch';

class MemoryCache {
  constructor() {
    this.cache = {};
  }

  async get(key) {
    return this.cache[key];
  }

  async put(key, value) {
    this.cache[key] = value;
  }

  async delete(key) {
    delete this.cache[key];
  }

  syncToDisk(path) {
    fs.writeFileSync(path, JSON.stringify(this.cache));
  }
}

// Initialize environment
const cache = new MemoryCache();
initEnv({
  ...(JSON.parse(fs.readFileSync('./config.json'))).vars,
  DATABASE: cache,
}, i18n);

// Configure https proxy
const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
  console.log(`https proxy: ${proxy}`);
  const agent = new HttpsProxyAgent(proxy);
  const proxyFetch = async (url, init) => {
    return fetch(url, {agent, ...init});
  };
  global.fetch = proxyFetch;
}


// Delete all webhooks
const offset = {};
for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
  offset[token] = 0;
  const [id] = token.split(':');
  await deleteTelegramWebHook(token);
  console.log(`Webhook deleted for bot ${id}, If you want to use webhook, please visit  /init`);
}

// Loop to get updates
while (true) {
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    try {
      const {result} = await getUpdates(token, offset[token]);
      if (!result) {
        continue;
      }
      for (const update of result) {
        if (update.update_id >= offset[token]) {
          offset[token] = update.update_id + 1;
        }
        setImmediate(async () => {
          await handleMessage(token, update).catch(console.error);
        });
      }
      cache.syncToDisk('./cache.json');
    } catch (e) {
      console.error(e);
    }
  }
}