import {handleMessage} from './message.js';
import {ENV} from './env.js';

async function bindWebHookAction() {
  const result = [];
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
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

async function checkUpdateAction(request) {
  const ts = 'https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/timestamp';
  const timestamp = await fetch(ts).then((res) => res.text());
  const current = ENV.BUILD_TIMESTAMP;
  if (timestamp > current) {
    return new Response('当前版本已过期，请重新部署', {status: 200});
  } else {
    return new Response('当前版本已是最新', {status: 200});
  }
}

export async function handleRequest(request) {
  const {pathname} = new URL(request.url);
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction();
  }
  if (pathname.startsWith(`/check`)) {
    return checkUpdateAction(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhookAction(request);
  }
  return null;
}
