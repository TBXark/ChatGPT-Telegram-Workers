import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';

// 中间件定义 function (message: xxx, context: Context): Promise<Response|null>
// 1. 当函数抛出异常时，结束消息处理，返回异常信息
// 2. 当函数返回 Response 对象时，结束消息处理，返回 Response 对象
// 3. 当函数返回 null 时，继续下一个中间件处理

export interface UpdateHandler {
    handle: (update: Telegram.Update, context: WorkerContext) => Promise<Response | null>;
}

export interface MessageHandler {
    handle: (message: Telegram.Message, context: WorkerContext) => Promise<Response | null>;
}
