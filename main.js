import {initEnv} from './src/env.js';
import {handleRequest} from './src/router.js';


export default {
  async fetch(request, env) {
    try {
      initEnv(env);
      const resp = await handleRequest(request);
      return resp || new Response('NOTFOUND', {status: 404});
    } catch (e) {
      // 如果返回4xx，5xx，Telegram会重试这个消息，后续消息就不会到达，所有webhook的错误都返回200
      console.error(e);
      return new Response('ERROR:' + e.message, {status: 200});
    }
  },
};
