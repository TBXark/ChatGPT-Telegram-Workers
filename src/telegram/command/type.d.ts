import type { TelegramChatType, TelegramMessage } from '../../types/telegram';
import type { WorkerContext } from '../../config/context';

export interface CommandHandler {
    command: string;
    help?: () => string;
    scopes?: string[];
    handle: (message: TelegramMessage, subcommand: string, context: WorkerContext) => Promise<Response>;
    needAuth?: (chatType: TelegramChatType) => string[] | null;
}
