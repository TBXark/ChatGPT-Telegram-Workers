import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';
import { ENV } from '../../config/env';
import { createTelegramBotAPI } from '../api';

export async function loadChatRoleWithContext(chatId: number, speakerId: number, context: WorkerContext): Promise<string | null> {
    const { groupAdminsKey } = context.SHARE_CONTEXT;
    if (!groupAdminsKey) {
        return null;
    }

    let groupAdmin: Telegram.ChatMember[] | null = null;
    try {
        groupAdmin = JSON.parse(await ENV.DATABASE.get(groupAdminsKey));
    } catch (e) {
        console.error(e);
    }
    if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
        const result = await api.getChatAdministratorsWithReturns({ chat_id: chatId });
        if (result == null) {
            return null;
        }
        groupAdmin = result.result;
        // 缓存120s
        await ENV.DATABASE.put(
            groupAdminsKey,
            JSON.stringify(groupAdmin),
            { expiration: (Date.now() / 1000) + 120 },
        );
    }
    for (let i = 0; i < groupAdmin.length; i++) {
        const user = groupAdmin[i];
        if (`${user.user?.id}` === `${speakerId}`) {
            return user.status;
        }
    }
    return 'member';
}
