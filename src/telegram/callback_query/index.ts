import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';
import { loadChatRoleWithContext } from '../command/auth';
import { MessageSender } from '../utils/send';
import { AgentListCallbackQueryHandler, ModelChangeCallbackQueryHandler, ModelListCallbackQueryHandler } from './system';

const QUERY_HANDLERS = [
    new AgentListCallbackQueryHandler(),
    new ModelListCallbackQueryHandler(),
    new ModelChangeCallbackQueryHandler(),
];

export async function handleCallbackQuery(callbackQuery: Telegram.CallbackQuery, context: WorkerContext): Promise<Response | null> {
    const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, callbackQuery);
    const answerCallbackQuery = (msg: string): Promise<Response> => {
        return sender.api.answerCallbackQuery({
            callback_query_id: callbackQuery.id,
            text: msg,
        });
    };
    try {
        if (!callbackQuery.message) {
            return null;
        }
        const chatId = callbackQuery.message.chat.id;
        const speakerId = callbackQuery.from?.id || chatId;
        const chatType = callbackQuery.message.chat.type;
        for (const handler of QUERY_HANDLERS) {
            // 如果存在权限条件
            if (handler.needAuth) {
                const roleList = handler.needAuth(chatType);
                if (roleList) {
                    // 获取身份并判断
                    const chatRole = await loadChatRoleWithContext(chatId, speakerId, context);
                    if (chatRole === null) {
                        return answerCallbackQuery('ERROR: Get chat role failed');
                    }
                    if (!roleList.includes(chatRole)) {
                        return answerCallbackQuery(`ERROR: Permission denied, need ${roleList.join(' or ')}`);
                    }
                }
            }
            if (callbackQuery.data) {
                if (callbackQuery.data.startsWith(handler.prefix)) {
                    return handler.handle(callbackQuery, callbackQuery.data, context);
                }
            }
        }
    } catch (e) {
        return answerCallbackQuery(`ERROR: ${(e as Error).message}`);
    }
    return null;
}
