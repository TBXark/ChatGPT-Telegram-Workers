import {handleMessage} from './message.js';
import {ENV} from './env.js';
import { setCommandForTelegram } from './command.js';
import { bindTelegramWebHook } from './telegram.js';

async function bindWebHookAction() {
  const result = {};
  let domain = ENV.WORKERS_DOMAIN
  if(domain.toLocaleLowerCase().startsWith("http")){
    domain = new URL(domain).host
  }
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token}/webhook`
    const id = token.split(':')[0]
    result[id] = {
      webhook: await bindTelegramWebHook(token, url),
      command: await setCommandForTelegram(token),
    }
  }
  return new Response(JSON.stringify(result), {status: 200});
}

// 处理Telegram回调
async function telegramWebhookAction(request) {
  const resp = await handleMessage(request);
  return resp || new Response('NOT HANDLED', {status: 200});
}

export async function handleRequest(request) {
  const {pathname} = new URL(request.url);
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction();
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhookAction(request);
  }
  if (pathname.startsWith(`/env`)){
    return new Response(JSON.stringify(ENV), {status: 200})
  }
  return null;
}
