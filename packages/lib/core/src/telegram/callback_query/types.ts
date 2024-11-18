import type { WorkerContext } from '#/config';
import type * as Telegram from 'telegram-bot-api-types';

export interface CallbackQueryHandler {
    prefix: string;
    handle: (query: Telegram.CallbackQuery, data: string, context: WorkerContext) => Promise<Response>;
    needAuth?: (chatType: string) => string[] | null;
}
