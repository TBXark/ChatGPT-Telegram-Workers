import { handleRequest } from './route';
import { errorToString } from './route/utils';
import i18n from './i18n';
import { ENV } from './config/env';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
        try {
            ENV.merge(env, i18n);
            return await handleRequest(request);
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), { status: 500 });
        }
    },
};
