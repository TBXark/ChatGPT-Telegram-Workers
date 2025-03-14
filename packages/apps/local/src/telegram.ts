import type { TelegramBotAPI } from '@chatgpt-telegram-workers/core';
import type { GetUpdatesResponse } from 'telegram-bot-api-types';
import type * as Telegram from 'telegram-bot-api-types';
import { createTelegramBotAPI } from '@chatgpt-telegram-workers/core';

export async function runPolling(tokens: string[], handler: (token: string, update: Telegram.Update) => Promise<Response | null>) {
    const clients: Record<string, TelegramBotAPI> = {};
    const offset: Record<string, number> = {};
    for (const token of tokens) {
        offset[token] = 0;
        const api = createTelegramBotAPI(token);
        clients[token] = api;
        const name = await api.getMeWithReturns();
        await api.deleteWebhook({});
        console.log(`@${name.result.username} Webhook deleted, If you want to use webhook, please set it up again.`);
    }

    const keepRunning = true;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (keepRunning) {
        for (const token of tokens) {
            try {
                const resp = await clients[token].getUpdates({ offset: offset[token] });
                if (resp.status === 429) {
                    const retryAfter = Number.parseInt(resp.headers.get('Retry-After') || '');
                    if (retryAfter) {
                        console.log(`Rate limited, retry after ${retryAfter} seconds`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                        continue;
                    }
                }
                const { result } = await resp.json() as GetUpdatesResponse;
                for (const update of result) {
                    if (update.update_id >= offset[token]) {
                        offset[token] = update.update_id + 1;
                    }
                    setImmediate(async () => {
                        await handler(token, update).catch(console.error);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}
