import type { WorkerContext } from '../../config/context';
import { DATABASE } from '../../config/env';
import { TelegramBotAPI } from '../api/api';
import type { Telegram, TelegramAPISuccess } from '../../types/telegram';

export async function loadChatRoleWithContext(context: WorkerContext): Promise<string | null> {
    const {
        chatId,
        speakerId,
        groupAdminKey,
        currentBotToken: token,
    } = context.SHARE_CONTEXT;

    if (groupAdminKey === null) {
        return null;
    }

    let groupAdmin: Telegram.ChatMemberAdministrator[] | null = null;
    try {
        groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
    } catch (e) {
        console.error(e);
    }
    if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const result = await TelegramBotAPI.from(token).getChatAdministrators({ chat_id: chatId }).then(res => res.json()).catch(() => null) as TelegramAPISuccess<Telegram.ChatMemberAdministrator[]>;
        if (result == null) {
            return null;
        }
        groupAdmin = result.result;
        // 缓存120s
        await DATABASE.put(
            groupAdminKey,
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
