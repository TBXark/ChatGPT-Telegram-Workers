import { ENV } from './config';
import { createRouter } from './route';

export * from './agent';
export * from './config';
export * from './i18n';
export * from './route';
export * from './telegram';

export const Workers = {
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
