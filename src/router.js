import {handleMessage} from './message.js';
import {ENV} from './env.js';

async function bindWebHookAction() {
  const result = [];
  const tokenSet = new Set();
  if (ENV.TELEGRAM_TOKEN) {
    tokenSet.add(ENV.TELEGRAM_TOKEN);
  }
  ENV.TELEGRAM_AVAILABLE_TOKENS.forEach((token) => tokenSet.add(token));
  for (const token of tokenSet) {
    const resp = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://${ENV.WORKERS_DOMAIN}/telegram/${token}/webhook`,
          }),
        },
    ).then((res) => res.json());
    result.push(resp);
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
  return null;
}
