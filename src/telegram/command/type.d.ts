import type { WorkerContext } from '../../config/context';
import type { Telegram } from '../../types/telegram';

export interface CommandHandler {
    command: string;
    help?: () => string;
    scopes?: string[];
    handle: (message: Telegram.Message, subcommand: string, context: WorkerContext) => Promise<Response>;
    needAuth?: (chatType: string) => string[] | null;
}
