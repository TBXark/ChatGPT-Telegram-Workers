import { ENV } from '../../config';

export const TELEGRAM_AUTH_CHECKER = {
    default(chatType: string): string[] | null {
        if (isGroupChat(chatType)) {
            return ['administrator', 'creator'];
        }
        return null;
    },
    shareModeGroup(chatType: string): string[] | null {
        if (isGroupChat(chatType)) {
            // 每个人在群里有上下文的时候，不限制
            if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
                return null;
            }
            return ['administrator', 'creator'];
        }
        return null;
    },
};

export function isGroupChat(type: string): boolean {
    return type === 'group' || type === 'supergroup';
}
