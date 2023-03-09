import {sendMessageToTelegram, getChatRole} from './telegram.js';
import {DATABASE, ENV, CONST} from './env.js';
import {SHARE_CONTEXT, USER_CONFIG, CURRENT_CHAT_CONTEXT} from './context.js';

// / --  Command
function defaultGroupAuthCheck() {
  if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    return ['administrator', 'creator'];
  }
  return false;
}

function shareModeGroupAuthCheck() {
  if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    // 每个人在群里有上下文的时候，不限制
    if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
      return false;
    }
    return ['administrator', 'creator'];
  }
  return false;
}

// BotCommandScope: default, all_private_chats, all_group_chats, all_chat_administrators

// 命令绑定
const commandHandlers = {
  '/help': {
    help: '获取命令帮助',
    scope: ['all_private_chats', 'all_chat_administrators'],
    fn: commandGetHelp,
  },
  '/new': {
    help: '发起新的对话',
    scope: ['default'],
    fn: commandCreateNewChatContext,
    needAuth: shareModeGroupAuthCheck,
  },
  '/start': {
    help: '获取你的ID，并发起新的对话',
    scope: ['all_private_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: defaultGroupAuthCheck,
  },
  '/version': {
    help: '获取当前版本号, 判断是否需要更新',
    scope: ['all_private_chats', 'all_chat_administrators'],
    fn: commandFetchUpdate,
    needAuth: defaultGroupAuthCheck,
  },
  '/setenv': {
    help: '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
    scope: [],
    fn: commandUpdateUserConfig,
    needAuth: shareModeGroupAuthCheck,
  },
  '/usage': {
    help: '获取当前机器人的用量统计',
    scope: ['all_private_chats', 'all_chat_administrators'],
    fn: commandUsage,
    needAuth: defaultGroupAuthCheck,
  },
  '/system': {
    help: '查看当前一些系统信息',
    scope: ['all_private_chats', 'all_chat_administrators'],
    fn: commandSystem,
    needAuth: defaultGroupAuthCheck,
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
        ` 发现新版本，当前版本: ${JSON.stringify(current)}，最新版本: ${JSON.stringify(online)}`,
    );
  } else {
    return sendMessageToTelegram(`当前已经是最新版本, 当前版本: ${JSON.stringify(current)}`);
  }
}

async function commandUsage() {
  const usage = await DATABASE.get(SHARE_CONTEXT.usageKey).then((res) => JSON.parse(res));
  let text = '📊 当前机器人用量\n\n';

  text += 'Tokens:\n';
  if (usage?.tokens) {
    const {tokens} = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort((a, b) => tokens.chats[b] - tokens.chats[a]);
    let i = 0;

    text += `- 总用量：${tokens.total || 0} tokens\n- 各聊天用量：`;
    for (const chatId of sortedChats) {
      // 最多显示 30 行
      if (i === 30) {
        text += '\n  ...';
        break;
      }
      i++;
      text += `\n  - ${chatId}: ${tokens.chats[chatId]} tokens`;
    }

    if (!i) {
      text += '0 tokens';
    }
  } else {
    text += '- 暂无用量';
  }

  return sendMessageToTelegram(text);
}

async function commandSystem(message) {
  let msg = `当前系统信息如下:\n`;
  msg+='当前OpenAI接口使用模型:'+ENV.CHAT_MODEL+'\n';
  return sendMessageToTelegram(msg);
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

export async function bindCommandForTelegram(token) {
  const scopeCommandMap = {};
  for (const key in commandHandlers) {
    if (commandHandlers.hasOwnProperty(key) && commandHandlers[key].scope) {
      for (const scope of commandHandlers[key].scope) {
        if (!scopeCommandMap[scope]) {
          scopeCommandMap[scope] = [];
        }
        scopeCommandMap[scope].push(key);
      }
    }
  }

  const result = {};
  for (const scope in scopeCommandMap) {
    result[scope] = await fetch(
        `https://api.telegram.org/bot${token}/setMyCommands`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commands: scopeCommandMap[scope].map((command) => ({
              command,
              description: commandHandlers[command].help,
            })),
            scope: {
              type: scope,
            },
          }),
        },
    ).then((res) => res.json());
  }
  return { ok: true , result: result}
}
