import type { WorkerContext } from '#/config';
import type * as Telegram from 'telegram-bot-api-types';

export interface CommandHandler {
    command: string;
    scopes?: string[];
    handle: (message: Telegram.Message, subcommand: string, context: WorkerContext) => Promise<Response>;
    needAuth?: (chatType: string) => string[] | null;
}
