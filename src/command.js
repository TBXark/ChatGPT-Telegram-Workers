import {sendMessageToTelegram} from './telegram.js';
import {DATABASE, ENV} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, CURRENT_CHAT_CONTEXT} from './context.js';

// / --  Command
// 命令绑定
const commandHandlers = {
  '/help': {
    help: '获取命令帮助',
    fn: commandGetHelp,
  },
  '/new': {
    help: '发起新的对话',
    fn: commandCreateNewChatContext,
  },
  '/start': {
    help: '获取你的ID，并发起新的对话',
    fn: commandCreateNewChatContext,
  },
  '/version': {
    help: '获取当前版本号, 判断是否需要更新',
    fn: commandFetchUpdate,
  },
  '/setenv': {
    help: '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
    fn: commandUpdateUserConfig,
  },
};

// 命令帮助
async function commandGetHelp(message, command, subcommand) {
  const helpMsg =
      '当前支持以下命令:\n' +
      Object.keys(commandHandlers)
          .map((key) => `${key}：${commandHandlers[key].help}`)
          .join('\n');
  return sendMessageToTelegram(helpMsg);
}

// 新的会话
async function commandCreateNewChatContext(message, command, subcommand) {
  try {
    await DATABASE.delete(SHARE_CONTEXT.chatHistoryKey);
    if (command === '/new') {
      return sendMessageToTelegram('新的对话已经开始');
    } else {
      if (SHARE_CONTEXT.chatType==='private') {
        return sendMessageToTelegram(
            `新的对话已经开始，你的ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      } else {
        return sendMessageToTelegram(
            `新的对话已经开始，群组ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}

// 用户配置修改
async function commandUpdateUserConfig(message, command, subcommand) {
  const kv = subcommand.indexOf('=');
  if (kv === -1) {
    return sendMessageToTelegram(
        '配置项格式错误: 命令完整格式为 /setenv KEY=VALUE',
    );
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  try {
    switch (typeof USER_CONFIG[key]) {
      case 'number':
        USER_CONFIG[key] = Number(value);
        break;
      case 'boolean':
        USER_CONFIG[key] = value === 'true';
        break;
      case 'string':
        USER_CONFIG[key] = value;
        break;
      case 'object':
        const object = JSON.parse(value);
        if (typeof object === 'object') {
          USER_CONFIG[key] = object;
          break;
        }
        return sendMessageToTelegram('不支持的配置项或数据类型错误');
      default:
        return sendMessageToTelegram('不支持的配置项或数据类型错误');
    }
    await DATABASE.put(
        SHARE_CONTEXT.configStoreKey,
        JSON.stringify(USER_CONFIG),
    );
    return sendMessageToTelegram('更新配置成功');
  } catch (e) {
    return sendMessageToTelegram(`配置项格式错误: ${e.message}`);
  }
}

async function commandFetchUpdate(message, command, subcommand) {
  const config = {
    headers: {
      'User-Agent': 'TBXark/ChatGPT-Telegram-Workers',
    },
  };
  const ts = 'https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/timestamp';
  const sha = 'https://api.github.com/repos/TBXark/ChatGPT-Telegram-Workers/commits/master';
  const shaValue = await fetch(sha, config).then((res) => res.json()).then((res) => res.sha.slice(0, 7));
  const tsValue = await fetch(ts, config).then((res) => res.text()).then((res) => Number(res.trim()));
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION,
  };
  const online = {
    ts: tsValue,
    sha: shaValue,
  };
  if (current.ts < online.ts) {
    return sendMessageToTelegram(
        ` 发现新版本， 当前版本: ${JSON.stringify(current)}，最新版本: ${JSON.stringify(online)}`,
    );
  } else {
    return sendMessageToTelegram(`当前已经是最新版本, 当前版本: ${JSON.stringify(current)}`);
  }
}

export async function handleCommandMessage(message) {
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + ' ')) {
      const command = commandHandlers[key];
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand);
      } catch (e) {
        return sendMessageToTelegram(`命令执行错误: ${e.message}`);
      }
    }
  }
  return null;
}

export async function setCommandForTelegram(token) {
  return await fetch(
      `https://api.telegram.org/bot${token}/setMyCommands`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: Object.keys(commandHandlers).map((key) => ({
            command: key,
            description: commandHandlers[key].help,
          })),
        }),
      },
  ).then((res) => res.json());
}
