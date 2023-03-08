import {DATABASE, ENV, CONST} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, CURRENT_CHAT_CONTEXT} from './context.js';
import {sendMessageToTelegram, sendChatActionToTelegram, getChatRole} from './telegram.js';
import {sendMessageToChatGPT} from './openai.js';

// / --  Command
// 命令绑定
const commandHandlers = {
  '/help': {
    help: '获取命令帮助',
    hidden: true,
    fn: commandGetHelp,
  },
  '/new': {
    help: '发起新的对话',
    fn: commandCreateNewChatContext,
    needAuth: function() {
      if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
        // 每个人在群里有上下文的时候，不限制
        if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
          return false;
        }
        return ['administrator', 'creator'];
      }
      return false;
    },
  },
  '/start': {
    help: '获取你的ID，并发起新的对话',
    hidden: true,
    fn: commandCreateNewChatContext,
    needAuth: function() {
      if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
        return ['administrator', 'creator'];
      }
      return false;
    },
  },
  '/version': {
    help: '获取当前版本号, 判断是否需要更新',
    hidden: true,
    fn: commandFetchUpdate,
    needAuth: function() {
      if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
        return ['administrator', 'creator'];
      }
      return false;
    },
  },
  '/setenv': {
    help: '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
    hidden: true,
    fn: commandUpdateUserConfig,
    needAuth: function() {
      if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
        return ['administrator', 'creator'];
      }
      return false;
    },
  },
  '/setinit': {
    help: '设置开始新会话时发送的内容，“咒语”',
    fn: (message, command, subcommand) => commandUpdateUserConfig(message, command, "SYSTEM_INIT_MESSAGE=" + subcommand),
    needAuth: function() {
      if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
        return ['administrator', 'creator'];
      }
      return false;
    },
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
    if (command === '/start') {
      if (SHARE_CONTEXT.chatType==='private') {
        sendMessageToTelegram(
            `新的对话已经开始，你的ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      } else {
        sendMessageToTelegram(
            `新的对话已经开始，群组ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
    sendChatActionToTelegram('typing').then(console.log).catch(console.error);
    const initMessage = subcommand || USER_CONFIG.SYSTEM_INIT_MESSAGE;
    const history = [];
    const answer = await sendMessageToChatGPT(initMessage, history);
    history.push({role: 'user', content: initMessage});
    history.push({role: 'assistant', content: answer});
    await DATABASE.put(SHARE_CONTEXT.chatHistoryKey, JSON.stringify(history));
    return sendMessageToTelegram(answer);
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
  if (!value) {
    return sendMessageToTelegram('请输入内容');
  }
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
      try {
        // 如果存在权限条件
        if (command.needAuth) {
          const roleList = command.needAuth();
          if (roleList) {
            // 获取身份并判断
            const chatRole = await getChatRole(SHARE_CONTEXT.speekerId);
            if (chatRole === null) {
              return sendMessageToTelegram('身份权限验证失败');
            }
            if (!roleList.includes(chatRole)) {
              return sendMessageToTelegram(`权限不足,需要${roleList.join(',')},当前:${chatRole}`);
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegram(`身份验证出错:` + e.message);
      }
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
          commands: Object.entries(commandHandlers).filter(([key, value]) => !value.hidden)
            .map(([key, value]) => ({
              command: key,
              description: value.help,
            })),
        }),
      },
  ).then((res) => res.json());
}
