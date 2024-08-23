import { WorkerContext } from '../../config/context';
import type { TelegramMessage, TelegramWebhookRequest } from '../../types/telegram';
import { ChatHandler } from './chat';
import { GroupMention } from './group';
import type { MessageHandler } from './type';
import {
    CommandHandler,
    EnvChecker,
    MessageFilter,
    OldMessageFilter,
    SaveLastMessage,
    WhiteListFilter,
} from './handlers';

function loadMessage(body: TelegramWebhookRequest): TelegramMessage {
    if (body?.edited_message) {
        throw new Error('Ignore edited message');
    }
    if (body?.message) {
        return body?.message;
    } else {
        throw new Error('Invalid message');
    }
}

// 消息处理中间件
const SHARE_HANDLER: MessageHandler[] = [
    // 检查环境是否准备好: DATABASE
    new EnvChecker(),
    // 过滤非白名单用户, 提前过滤减少KV消耗
    new WhiteListFilter(),
    // 过滤不支持的消息(抛出异常结束消息处理)
    new MessageFilter(),
    // 处理群消息，判断是否需要响应此条消息
    new GroupMention(),
    // 忽略旧消息
    new OldMessageFilter(),
    // DEBUG: 保存最后一条消息,按照需求自行调整此中间件位置
    new SaveLastMessage(),
    // 处理命令消息
    new CommandHandler(),
    // 与llm聊天
    new ChatHandler(),
];

export async function handleMessage(token: string, body: TelegramWebhookRequest): Promise<Response | null> {
    const message = loadMessage(body);
    const context = await WorkerContext.from(token, message);

    for (const handler of SHARE_HANDLER) {
        try {
            const result = await handler.handle(message, context);
            if (result) {
                return result;
            }
        } catch (e) {
            return new Response(JSON.stringify({
                message: (e as Error).message,
                stack: (e as Error).stack,
            }), { status: 500 });
        }
    }
    return null;
}
