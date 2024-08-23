import type { TelegramMessage } from '../../types/telegram';
import type { WorkerContext } from '../../config/context';

// 中间件定义 function (message: TelegramMessage, context: Context): Promise<Response|null>
// 1. 当函数抛出异常时，结束消息处理，返回异常信息
// 2. 当函数返回 Response 对象时，结束消息处理，返回 Response 对象
// 3. 当函数返回 null 时，继续下一个中间件处理
export interface MessageHandler {
    handle: (message: TelegramMessage, context: WorkerContext) => Promise<Response | null>;
}
