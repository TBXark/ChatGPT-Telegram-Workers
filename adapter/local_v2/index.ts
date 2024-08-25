import fs from 'node:fs';
import * as process from 'node:process';
import { LocalCache } from 'cloudflare-worker-adapter';
import { ENV } from '../../src/config/env.js';
import i18n from '../../src/i18n/index.js';
import { handleUpdate } from '../../src/telegram/handler';

// 如果你的环境需要代理才能访问Telegram API，请取消注释下面的代码，并根据实际情况修改代理地址
// eslint-disable-next-line import/order
import { installFetchProxy } from 'cloudflare-worker-adapter/fetchProxy';
import { createTelegramBotAPI } from '../../src/telegram/api';
import type { TelegramBotAPI } from '../../src/telegram/api';

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
ENV.merge({
    ...(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')).vars),
    DATABASE: cache,
}, i18n);

// Delete all webhooks
const clients: Record<string, TelegramBotAPI> = {};
const offset: Record<string, number> = {};
for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    offset[token] = 0;
    const api = createTelegramBotAPI(token);
    clients[token] = api;
    const name = await api.getMeWithReturns();
    await api.deleteWebhook({});
    console.log(`@${name.result.username} Webhook deleted, If you want to use webhook, please set it up again.`);
}

while (true) {
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        try {
            const { result } = await clients[token].getUpdatesWithReturns({ offset: offset[token] });
            for (const update of result) {
                if (update.update_id >= offset[token]) {
                    offset[token] = update.update_id + 1;
                }
                setImmediate(async () => {
                    await handleUpdate(token, update).catch(console.error);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}
