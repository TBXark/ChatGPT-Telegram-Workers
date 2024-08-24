import type { WorkerContext } from '../../config/context';
import { DATABASE } from '../../config/env';
import { createTelegramBotAPI } from '../api';
import type { Telegram } from '../../types/telegram';

export async function loadChatRoleWithContext(message: Telegram.Message, context: WorkerContext): Promise<string | null> {
    const { groupAdminsKey } = context.SHARE_CONTEXT;

    const chatId = message.chat.id;
    const speakerId = message.from?.id || chatId;

    if (!groupAdminsKey) {
        return null;
    }

    let groupAdmin: Telegram.ChatMemberAdministrator[] | null = null;
    try {
        groupAdmin = JSON.parse(await DATABASE.get(groupAdminsKey));
    } catch (e) {
        console.error(e);
    }
    if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
        const result = await api.getChatAdministrators({ chat_id: chatId }).then(res => res.json()).catch(() => null) as Telegram.ResponseSuccess<Telegram.ChatMemberAdministrator[]>;
        if (result == null) {
            return null;
        }
        groupAdmin = result.result;
        // 缓存120s
        await DATABASE.put(
            groupAdminsKey,
            JSON.stringify(groupAdmin),
            { expiration: (Date.now() / 1000) + 120 },
        );
    }
    for (let i = 0; i < groupAdmin.length; i++) {
        const user = groupAdmin[i];
        if (`${user.user.id}` === `${speakerId}`) {
            return user.status;
        }
    }
    return 'member';
}
