import {initEnv} from './src/env.js';
import {handleRequest} from './src/router.js';
import {errorToString} from './src/utils.js';


export default {
  async fetch(request, env) {
    try {
      initEnv(env);
      const resp = await handleRequest(request);
      return resp || new Response('NOTFOUND', {status: 404});
    } catch (e) {
      // 如果返回4xx，5xx，Telegram會重試這個消息，後續消息就不會到達，所有webhook的錯誤都返回200
      console.error(e);
      return new Response(errorToString(e), {status: 200});
    }
  },
};
