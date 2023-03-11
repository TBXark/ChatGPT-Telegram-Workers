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
    // 每個人在群里有上下文的時候，不限制
    if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
      return false;
    }
    return ['administrator', 'creator'];
  }
  return false;
}

// BotCommandScope: default, all_private_chats, all_group_chats, all_chat_administrators

// 命令綁定
const commandHandlers = {
  '/help': {
    help: '獲取命令幫助',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandGetHelp,
  },
  '/new': {
    help: '發起新的對話',
    scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: shareModeGroupAuthCheck,
  },
  '/start': {
    help: '獲取你的ID，並發起新的對話',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: defaultGroupAuthCheck,
  },
  '/version': {
    help: '獲取當前版本號, 判斷是否需要更新',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandFetchUpdate,
    needAuth: defaultGroupAuthCheck,
  },
  '/setenv': {
    help: '設置用戶配置，命令完整格式為 /setenv KEY=VALUE',
    scopes: [],
    fn: commandUpdateUserConfig,
    needAuth: shareModeGroupAuthCheck,
  },
  '/usage': {
    help: '獲取當前機器人的用量統計',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandUsage,
    needAuth: defaultGroupAuthCheck,
  },
  '/system': {
    help: '查看當前一些系統信息',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandSystem,
    needAuth: defaultGroupAuthCheck,
  },
};

// 命令幫助
async function commandGetHelp(message, command, subcommand) {
  const helpMsg =
      '當前支持以下命令:\n' +
      Object.keys(commandHandlers)
          .map((key) => `${key}：${commandHandlers[key].help}`)
          .join('\n');
  return sendMessageToTelegram(helpMsg);
}

// 新的會話
async function commandCreateNewChatContext(message, command, subcommand) {
  try {
    await DATABASE.delete(SHARE_CONTEXT.chatHistoryKey);
    if (command === '/new') {
      return sendMessageToTelegram('新的對話已經開始');
    } else {
      if (SHARE_CONTEXT.chatType==='private') {
        return sendMessageToTelegram(
            `新的對話已經開始，你的ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      } else {
        return sendMessageToTelegram(
            `新的對話已經開始，群組ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}

// 用戶配置修改
async function commandUpdateUserConfig(message, command, subcommand) {
  const kv = subcommand.indexOf('=');
  if (kv === -1) {
    return sendMessageToTelegram(
        '配置項格式錯誤: 命令完整格式為 /setenv KEY=VALUE',
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
        return sendMessageToTelegram('不支持的配置項或數據類型錯誤');
      default:
        return sendMessageToTelegram('不支持的配置項或數據類型錯誤');
    }
    await DATABASE.put(
        SHARE_CONTEXT.configStoreKey,
        JSON.stringify(USER_CONFIG),
    );
    return sendMessageToTelegram('更新配置成功');
  } catch (e) {
    return sendMessageToTelegram(`配置項格式錯誤: ${e.message}`);
  }
}

async function commandFetchUpdate(message, command, subcommand) {
  const config = {
    headers: {
      'User-Agent': 'TBXark/ChatGPT-Telegram-Workers',
    },
  };
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION,
  };

  const ts = 'https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/timestamp';
  const info = 'https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/master/dist/buildinfo.json';
  let online = await fetch(info, config)
      .then((r) => r.json())
      .catch(() => null);
  if (!online) {
    online = await fetch(ts).then((r) => r.text())
        .then((ts) => ({ts: Number(ts.trim()), sha: 'unknown'}))
        .catch(() => ({ts: 0, sha: 'unknown'}));
  }

  if (current.ts < online.ts) {
    return sendMessageToTelegram(
        ` 發現新版本，當前版本: ${JSON.stringify(current)}，最新版本: ${JSON.stringify(online)}`,
    );
  } else {
    return sendMessageToTelegram(`當前已經是最新版本, 當前版本: ${JSON.stringify(current)}`);
  }
}


async function commandUsage() {
  const usage = JSON.parse(await DATABASE.get(SHARE_CONTEXT.usageKey));
  let text = '📊 當前機器人用量\n\nTokens:\n';
  if (usage?.tokens) {
    const {tokens} = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort((a, b) => tokens.chats[b] - tokens.chats[a]);

    text += `- 總用量：${tokens.total || 0} tokens\n- 各聊天用量：`;
    for (let i = 0; i < Math.min(sortedChats.length, 30); i++) {
      text += `\n  - ${sortedChats[i]}: ${tokens.chats[sortedChats[i]]} tokens`;
    }
    if (sortedChats.length === 0) {
      text += '0 tokens';
    } else if (sortedChats.length > 30) {
      text += '\n  ...';
    }
  } else {
    text += '- 暫無用量';
  }
  return sendMessageToTelegram(text);
}

async function commandSystem(message) {
  let msg = `當前系統信息如下:\n`;
  msg+='OpenAI模型:'+ENV.CHAT_MODEL+'\n';
  if (ENV.DEBUG_MODE) {
    msg+=`OpenAI參數: ${JSON.stringify(USER_CONFIG.OPENAI_API_EXTRA_PARAMS)}\n`;
    msg+=`初始化文本: ${USER_CONFIG.SYSTEM_INIT_MESSAGE}\n`;
    // if (ENV.DEV_MODE) {
    //   const shareCtx = {...SHARE_CONTEXT};
    //   shareCtx.currentBotToken = '***';
    //   msg += `當前上下文: \n${JSON.stringify(shareCtx, null, 2)}\n`;
    // }
  }
  return sendMessageToTelegram(msg);
}

export async function handleCommandMessage(message) {
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + ' ')) {
      const command = commandHandlers[key];
      try {
        // 如果存在權限條件
        if (command.needAuth) {
          const roleList = command.needAuth();
          if (roleList) {
            // 獲取身份並判斷
            const chatRole = await getChatRole(SHARE_CONTEXT.speekerId);
            if (chatRole === null) {
              return sendMessageToTelegram('身份權限驗證失敗');
            }
            if (!roleList.includes(chatRole)) {
              return sendMessageToTelegram(`權限不足,需要${roleList.join(',')},當前:${chatRole}`);
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegram(`身份驗證出錯:` + e.message);
      }
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand);
      } catch (e) {
        return sendMessageToTelegram(`命令執行錯誤: ${e.message}`);
      }
    }
  }
  return null;
}

export async function bindCommandForTelegram(token) {
  const scopeCommandMap = {};
  for (const key in commandHandlers) {
    if (commandHandlers.hasOwnProperty(key) && commandHandlers[key].scopes) {
      for (const scope of commandHandlers[key].scopes) {
        if (!scopeCommandMap[scope]) {
          scopeCommandMap[scope] = [];
        }
        scopeCommandMap[scope].push(key);
      }
    }
  }

  const result = {};
  for (const scope in scopeCommandMap) { // eslint-disable-line
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
  return {ok: true, result: result};
}


export function commandsHelp() {
  return Object.keys(commandHandlers).map((key) => {
    const command = commandHandlers[key];
    return {
      command: key,
      description: command.help,
    };
  });
}
