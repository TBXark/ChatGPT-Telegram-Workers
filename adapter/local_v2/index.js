import fs from 'node:fs';
import { ENV, initEnv } from '../../src/config/env.js';
import { deleteTelegramWebHook, getTelegramUpdates } from '../../src/telegram/telegram.js';
import i18n from '../../src/i18n/index.js';
import { handleMessage } from '../../src/telegram/message.js';
import { MemoryCache } from './cache.js';
// 如果你的环境需要代理才能访问Telegram API，请取消注释下面的代码，并根据实际情况修改代理地址
// import './proxy-fetch.js';

const {
    CONFIG_PATH = './config.json',
    CACHE_PATH = './cache.json',
} = process.env;

// Initialize environment
const cache = new MemoryCache();
initEnv({
    ...(JSON.stringify(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')).vars)),
    DATABASE: cache,
}, i18n);

// Delete all webhooks
const offset = {};
for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    offset[token] = 0;
    const [id] = token.split(':');
    await deleteTelegramWebHook(token);
    console.log(`Webhook deleted for bot ${id}, If you want to use webhook, please visit  /init`);
}

// noinspection InfiniteLoopJS
while (true) {
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        try {
            /**
             * @type {TelegramWebhookRequest[]}
             */
            const { result } = await getTelegramUpdates(token, offset[token]);
            for (const update of result) {
                if (update.update_id >= offset[token]) {
                    offset[token] = update.update_id + 1;
                }
                setImmediate(async () => {
                    await handleMessage(token, update).catch(console.error);
                });
            }
            cache.syncToDisk(CACHE_PATH);
        } catch (e) {
            console.error(e);
        }
    }
}
