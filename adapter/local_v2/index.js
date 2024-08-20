import fs from 'node:fs';
import * as process from 'node:process';
import { LocalCache } from 'cloudflare-worker-adapter/localCache';
import { ENV, initEnv } from '../../src/config/env.js';
import { deleteTelegramWebHook, getBotName, getTelegramUpdates } from '../../src/telegram/telegram.js';
import i18n from '../../src/i18n/index.js';
import { handleMessage } from '../../src/telegram/message.js';

// 如果你的环境需要代理才能访问Telegram API，请取消注释下面的代码，并根据实际情况修改代理地址
// eslint-disable-next-line import/order
import { installFetchProxy } from 'cloudflare-worker-adapter/fetchProxy';

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
installFetchProxy(proxy);

const {
    CONFIG_PATH = './config.json',
    CACHE_PATH = './cache.json',
} = process.env;

if (!fs.existsSync(CACHE_PATH)) {
    fs.writeFileSync(CACHE_PATH, '{}');
}

// Initialize environment
const cache = new LocalCache(CACHE_PATH);
initEnv({
    ...(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')).vars),
    DATABASE: cache,
}, i18n);

// Delete all webhooks
const offset = {};
for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    offset[token] = 0;
    const name = await getBotName(token);
    await deleteTelegramWebHook(token);
    console.log(`@${name} Webhook deleted, If you want to use webhook, please set it up again.`);
}

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
        } catch (e) {
            console.error(e);
        }
    }
}
