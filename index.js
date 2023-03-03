// 你这两行代码直接添加信息，或者Workers配置界面填写环境变量， 环境变量的优先级比较高
let API_KEY = "PLEASE_REPLACE_WITH_YOUR_OPENAI_API_KEY";
let TELEGRAM_TOKEN = "PLEASE_REPLACE_WITH_YOUR_TELEGRAM_BOT_TOKEN";
let CHAT_WHITE_LIST = [];
let DATABASE = null;

export default {
  async fetch(request, env) {
    try {
      initGlobalEnv(env);
      const { pathname } = new URL(request.url);
      if (pathname.startsWith(`/telegram/${TELEGRAM_TOKEN}/webhook`)) {
        return handleTelegramWebhook(request, env);
      }
      if (pathname.startsWith(`/telegram/${TELEGRAM_TOKEN}/bind`)) {
        return bindTelegramWebHook();
      }
      return new Response("Notfound", { status: 404 });
    } catch (e) {
      return new Response(JSON.stringify(e), { status: 500 });
    }
  },
};

// Telegram
async function bindTelegramWebHook() {
  return await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://chat.tbxark.com/telegram/${TELEGRAM_TOKEN}/webhook`,
      }),
    }
  );
}

function initGlobalEnv(env) {
  if (env.API_KEY) {
    API_KEY = env.API_KEY;
  }
  if (env.TELEGRAM_TOKEN) {
    TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
  }
  if (env.CHAT_WHITE_LIST) {
    CHAT_WHITE_LIST = env.CHAT_WHITE_LIST.split(",");
  }
  if (env.Database) {
    Database = env.Database;
  }
}

async function handleTelegramWebhook(request, env) {
  const { message } = await request.json();
  const historyKey = `tg:${message.chat.id}`;
  if (!CHAT_WHITE_LIST.includes(`${message.chat.id}`)) {
    return sendMessageToTelegram(
      `你没有权限使用这个命令, 请请联系管理员添加你的ID(${message.chat.id})到白名单`,
      TELEGRAM_TOKEN,
      message.chat.id
    );
  }
  switch (message.text) {
    case "/new": {
      await deleteHistoryMessageFromWorkerCacheById(historyKey, env);
      return sendMessageToTelegram(
        "新的对话已经开始",
        TELEGRAM_TOKEN,
        message.chat.id
      );
    }
    default: {
      let history = await getHistoryMessageFromWorkerCacheById(historyKey, env);
      const answer = await sendMessageToChatGPT(message.text, history);
      const id = message.chat.id;
      if (!history || !Array.isArray(history) || history.length === 0) {
        history = [{ role: "system", content: "你是一个得力的助手" }];
      }
      history.push({ role: "user", content: message.text });
      history.push({ role: "assistant", content: answer });
      await pushMessageHistoryToWorkerCacheById(historyKey, history, env);
      return sendMessageToTelegram(answer, TELEGRAM_TOKEN, id);
    }
  }
}

async function sendMessageToTelegram(message, token, chatId) {
  return await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
}

// Cache
async function pushMessageHistoryToWorkerCacheById(id, messages, env) {
  await DATABASE.put(`history:${id}`, JSON.stringify(messages));
}

async function getHistoryMessageFromWorkerCacheById(id, env) {
  try {
    const messages = await DATABASE.get(`history:${id}`);
    return JSON.parse(messages);
  } catch (e) {
    return [];
  }
}

async function deleteHistoryMessageFromWorkerCacheById(id, env) {
  await DATABASE.delete(`history:${id}`);
}

// ChatGPT
async function sendMessageToChatGPT(message, history) {
  try {
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        ...(history ? history : []),
        { role: "user", content: message },
      ],
    };
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    return resp.choices[0].message.content;
  } catch (e) {
    console.error(e);
    return "我不知道该怎么回答";
  }
}
