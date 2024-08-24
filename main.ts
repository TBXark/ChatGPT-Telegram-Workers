import { initEnv } from './src/config/env';
import { handleRequest } from './src/route';
import { errorToString } from './src/route/utils';
import i18n from './src/i18n/index';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        try {
            initEnv(env, i18n);
            return await handleRequest(request);
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), { status: 500 });
        }
    },
};