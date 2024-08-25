import { handleRequest } from './src/route';
import { errorToString } from './src/route/utils';
import i18n from './src/i18n/index';
import { ENV, initEnv } from './src/config/share';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        try {
            initEnv(env, ENV, i18n);
            return await handleRequest(request);
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), { status: 500 });
        }
    },
};
