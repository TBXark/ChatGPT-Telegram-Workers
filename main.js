import {initEnv} from './src/config/env.js';
import {handleRequest} from './src/route.js';
import {errorToString} from './src/utils/utils.js';
import i18n from './src/i18n/index.js';


export default {
  async fetch(request, env) {
    try {
      initEnv(env, i18n);
      return await handleRequest(request);
    } catch (e) {
      console.error(e);
      return new Response(errorToString(e), {status: 500});
    }
  },
};
