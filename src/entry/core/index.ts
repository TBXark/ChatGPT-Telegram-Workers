import { ENV } from '../../config/env';
import { createRouter } from '../../route';

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
