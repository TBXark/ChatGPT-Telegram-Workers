import { createRouter } from './route';
import { createTelegramBotAPI } from './telegram/api';
import { handleUpdate } from './telegram/handler';
import { ENV } from './config/env';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        try {
            ENV.merge(env);
            return createRouter().fetch(request);
        } catch (e) {
            console.error(e);
            return new Response(JSON.stringify({
                message: (e as Error).message,
                stack: (e as Error).stack,
            }), { status: 500 });
        }
    },
};

// 暴露给adapter使用的函数和变量
export {
    ENV,
    createRouter,
    createTelegramBotAPI,
    handleUpdate,
};
