import type { TelegramChatType } from '../../types/telegram';

export function isTelegramChatTypeGroup(type: TelegramChatType): boolean {
    return type === 'group' || type === 'supergroup';
}
