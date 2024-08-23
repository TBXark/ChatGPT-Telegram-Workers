import type { WorkerContext } from '../../config/context';
import { DATABASE } from '../../config/env';
import { getChatAdministrators } from '../api/telegram';

export async function loadChatRoleWithContext(context: WorkerContext): Promise<string | null> {
    const {
        chatId,
        speakerId,
        groupAdminKey,
        currentBotToken: token,
        allMemberAreAdmin,
    } = context.SHARE_CONTEXT;

    if (allMemberAreAdmin) {
        return 'administrator';
    }
    if (groupAdminKey === null) {
        return null;
    }

    let groupAdmin: any[] | null = null;
    try {
        groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
    } catch (e) {
        console.error(e);
    }
    if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const { result } = await getChatAdministrators(chatId, token);
        if (result == null) {
            return null;
        }
        groupAdmin = result;
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
