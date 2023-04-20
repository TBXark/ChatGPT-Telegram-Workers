/* eslint-disable indent */
import {
  sendMessageToTelegram,
  sendPhotoToTelegram,
  sendChatActionToTelegram,
  getChatRole,
} from './telegram.js';
import { DATABASE, ENV, CONST } from './env.js';
import { SHARE_CONTEXT, USER_CONFIG, CURRENT_CHAT_CONTEXT, USER_DEFINE } from './context.js';
import { requestImageFromOpenAI } from './openai.js';
import { mergeConfig } from './utils.js';

const commandAuthCheck = {
  default: function () {
    if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
      return ['administrator', 'creator'];
    }
    return false;
  },
  shareModeGroup: function () {
    if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
      // 每个人在群里有上下文的时候，不限制
      if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
        return false;
      }
      return ['administrator', 'creator'];
    }
    return false;
  },
};

// 命令绑定
const commandHandlers = {
  '/help': {
    help: 'Get command help',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandGetHelp,
  },
  '/new': {
    help: 'Initiate a new conversation',
    scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.shareModeGroup,
  },
  '/start': {
    help: 'Get your ID and start a new conversation',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.default,
  },
  // '/img': {
  //   help: 'Generate a picture, the complete format of the command is `/img <picture description>`, for example `/img beach in the moonlight`',
  //   scopes: ['all_private_chats', 'all_chat_administrators'],
  //   fn: commandGenerateImg,
  //   needAuth: commandAuthCheck.shareModeGroup,
  // },
  // '/setenv': {
  //   help: 'Set the user configuration, the complete format of the command is `/setenv KEY=VALUE`',
  //   scopes: [],
  //   fn: commandUpdateUserConfig,
  //   needAuth: commandAuthCheck.shareModeGroup,
  // },
  // '/version': {
  //   help: 'Get the current version number to determine whether it needs to be updated',
  //   scopes: ['all_private_chats', 'all_chat_administrators'],
  //   fn: commandFetchUpdate,
  //   needAuth: commandAuthCheck.default,
  // },
  // '/usage': {
  //   help: 'Get current robot usage statistics',
  //   scopes: ['all_private_chats', 'all_chat_administrators'],
  //   fn: commandUsage,
  //   needAuth: commandAuthCheck.default,
  // },
  // '/system': {
  //   help: 'View some current system information',
  //   scopes: ['all_private_chats', 'all_chat_administrators'],
  //   fn: commandSystem,
  //   needAuth: commandAuthCheck.default,
  // },
  // '/role': {
  //   help: 'Set a preset identity',
  //   scopes: ['all_private_chats'],
  //   fn: commandUpdateRole,
  //   needAuth: commandAuthCheck.shareModeGroup,
  // },
};

async function commandUpdateRole(message, command, subcommand) {
  // 显示
  if (subcommand === 'show') {
    const size = Object.getOwnPropertyNames(USER_DEFINE.ROLE).length;
    if (size === 0) {
      return sendMessageToTelegram('No role has been defined yet');
    }
    let showMsg = `The currently defined roles are as follows(${size}):\n`;

    for (const role in USER_DEFINE.ROLE) {
      if (USER_DEFINE.ROLE.hasOwnProperty(role)) {
        showMsg += `~${role}:\n<pre>`;
        showMsg += JSON.stringify(USER_DEFINE.ROLE[role]) + '\n';
        showMsg += '</pre>';
      }
    }
    CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';

    return sendMessageToTelegram(showMsg);
  }

  const helpMsg =
    'Format error: the complete format of the command is`/role operation`\n' +
    'The following operations are currently supported`:\n' +
    '`/role show` Display the currently defined role.\n' +
    '`/role character name del` Delete the role with the specified name.\n' +
    '`/role Character name KEY=VALUE` Set the configuration of the specified role.\n' +
    ' Currently the following settings:\n' +
    '  `SYSTEM_INIT_MESSAGE`: Initialization message\n' +
    '  `OPENAI_API_EXTRA_PARAMS`: OpenAI API Additional parameters，Must be JSON';

  const kv = subcommand.indexOf(' ');
  if (kv === -1) {
    return sendMessageToTelegram(helpMsg);
  }
  const role = subcommand.slice(0, kv);
  const settings = subcommand.slice(kv + 1).trim();
  const skv = settings.indexOf('=');
  if (skv === -1) {
    if (settings === 'del') {
      // delete
      try {
        if (USER_DEFINE.ROLE[role]) {
          delete USER_DEFINE.ROLE[role];
          await DATABASE.put(
            SHARE_CONTEXT.configStoreKey,
            JSON.stringify(Object.assign(USER_CONFIG, { USER_DEFINE: USER_DEFINE })),
          );
          return sendMessageToTelegram('The role was deleted successfully');
        }
      } catch (e) {
        return sendMessageToTelegram(`Delete role error: \`${e.message}\``);
      }
    }
    return sendMessageToTelegram(helpMsg);
  }
  const key = settings.slice(0, skv);
  const value = settings.slice(skv + 1);

  // ROLE Structure definition
  if (!USER_DEFINE.ROLE[role]) {
    USER_DEFINE.ROLE[role] = {
      // System initialization message
      SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
      // OpenAI API Additional parameters
      OPENAI_API_EXTRA_PARAMS: {},
    };
  }
  try {
    mergeConfig(USER_DEFINE.ROLE[role], key, value);
    await DATABASE.put(
      SHARE_CONTEXT.configStoreKey,
      JSON.stringify(Object.assign(USER_CONFIG, { USER_DEFINE: USER_DEFINE })),
    );
    return sendMessageToTelegram('The update configuration was successful');
  } catch (e) {
    return sendMessageToTelegram(`Configuration item format error: \`${e.message}\``);
  }
}

async function commandGenerateImg(message, command, subcommand) {
  if (subcommand === '') {
    return sendMessageToTelegram(
      'Please enter a picture description. The complete format of the command is `/img Raccoon cat`',
    );
  }
  try {
    setTimeout(() => sendChatActionToTelegram('upload_photo').catch(console.error), 0);
    const imgUrl = await requestImageFromOpenAI(subcommand);
    try {
      return sendPhotoToTelegram(imgUrl);
    } catch (e) {
      return sendMessageToTelegram(`picture:\n${imgUrl}`);
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR:IMG: ${e.message}`);
  }
}

// 命令帮助
async function commandGetHelp(message, command, subcommand) {
  const helpMsg =
    'The following commands are currently supported:\n' +
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
      return sendMessageToTelegram('A new dialogue has begun');
    } else {
      if (SHARE_CONTEXT.chatType === 'private') {
        return sendMessageToTelegram(
          `A new conversation has begun, your ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }

      return sendMessageToTelegram(
        `A new conversation has begun, group ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
      );
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}

async function commandUpdateUserConfig(message, command, subcommand) {
  const kv = subcommand.indexOf('=');
  if (kv === -1) {
    return sendMessageToTelegram(
      'Configuration item format error: The complete format of the command is `/setenv KEY=VALUE`',
    );
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  try {
    mergeConfig(USER_CONFIG, key, value);
    await DATABASE.put(SHARE_CONTEXT.configStoreKey, JSON.stringify(USER_CONFIG));
    return sendMessageToTelegram('The update configuration was successful');
  } catch (e) {
    return sendMessageToTelegram(`Configuration item format error: ${e.message}`);
  }
}

async function commandFetchUpdate(message, command, subcommand) {
  const config = {
    headers: {
      'User-Agent': CONST.USER_AGENT,
    },
  };
  const current = {
    ts: ENV.BUILD_TIMESTAMP,
    sha: ENV.BUILD_VERSION,
  };

  const repo = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.UPDATE_BRANCH}`;
  const ts = `${repo}/dist/timestamp`;
  const info = `${repo}/dist/buildinfo.json`;

  let online = await fetch(info, config)
    .then((r) => r.json())
    .catch(() => null);
  if (!online) {
    online = await fetch(ts, config)
      .then((r) => r.text())
      .then((ts) => ({ ts: Number(ts.trim()), sha: 'unknown' }))
      .catch(() => ({ ts: 0, sha: 'unknown' }));
  }

  if (current.ts < online.ts) {
    return sendMessageToTelegram(
      ` Discover the new version，current version: ${JSON.stringify(
        current,
      )}，latest version: ${JSON.stringify(online)}`,
    );
  } else {
    return sendMessageToTelegram(
      `It is currently the latest version, current version: ${JSON.stringify(current)}`,
    );
  }
}

async function commandUsage() {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return sendMessageToTelegram('Usage statistics are not turned on by the current robot');
  }

  const usage = JSON.parse(await DATABASE.get(SHARE_CONTEXT.usageKey));
  let text = '📊 Current robot usage\n\nTokens:\n';

  if (usage?.tokens) {
    const { tokens } = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort(
      (a, b) => tokens.chats[b] - tokens.chats[a],
    );

    text += `- Total usage：${tokens.total || 0} tokens\n- Usage of each chat：`;
    for (let i = 0; i < Math.min(sortedChats.length, 30); i++) {
      text += `\n  - ${sortedChats[i]}: ${tokens.chats[sortedChats[i]]} tokens`;
    }
    if (sortedChats.length === 0) {
      text += '0 tokens';
    } else if (sortedChats.length > 30) {
      text += '\n  ...';
    }
  } else {
    text += '- No amount available';
  }

  return sendMessageToTelegram(text);
}

async function commandSystem(message) {
  let msg = 'The current system information is as follows:\n';
  msg += `OpenAI model:${ENV.CHAT_MODEL}\n`;
  if (ENV.DEBUG_MODE) {
    msg += '<pre>';
    msg += `USER_CONFIG: \n${JSON.stringify(USER_CONFIG, null, 2)}\n`;
    if (ENV.DEV_MODE) {
      const shareCtx = { ...SHARE_CONTEXT };
      shareCtx.currentBotToken = 'ENPYPTED';
      msg += `CHAT_CONTEXT: \n${JSON.stringify(CURRENT_CHAT_CONTEXT, null, 2)}\n`;
      msg += `SHARE_CONTEXT: \n${JSON.stringify(shareCtx, null, 2)}\n`;
    }
    msg += '</pre>';
  }
  CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
  return sendMessageToTelegram(msg);
}

async function commandEcho(message) {
  let msg = '<pre>';
  msg += JSON.stringify({ message }, null, 2);
  msg += '</pre>';
  CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
  return sendMessageToTelegram(msg);
}

export async function handleCommandMessage(message) {
  if (ENV.DEV_MODE) {
    commandHandlers['/echo'] = {
      help: '[DEBUG ONLY] Echo message',
      scopes: ['all_private_chats', 'all_chat_administrators'],
      fn: commandEcho,
      needAuth: commandAuthCheck.default,
    };
  }
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + ' ')) {
      const command = commandHandlers[key];
      try {
        // 如果存在权限条件
        if (command.needAuth) {
          const roleList = command.needAuth();
          if (roleList) {
            // 获取身份并判断
            const chatRole = await getChatRole(SHARE_CONTEXT.speakerId);
            if (chatRole === null) {
              return sendMessageToTelegram('Authentication failed');
            }
            if (!roleList.includes(chatRole)) {
              return sendMessageToTelegram(
                `Insufficient authority, need ${roleList.join(',')}, current:${chatRole}`,
              );
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegram(`Authentication error: ${e.message}`);
      }
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand);
      } catch (e) {
        return sendMessageToTelegram(`Command execution error: ${e.message}`);
      }
    }
  }
  return null;
}

export async function bindCommandForTelegram(token) {
  const scopeCommandMap = {
    all_private_chats: [],
    all_group_chats: [],
    all_chat_administrators: [],
  };
  for (const key in commandHandlers) {
    if (ENV.HIDE_COMMAND_BUTTONS.includes(key)) {
      continue;
    }
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
  for (const scope in scopeCommandMap) {
    // eslint-disable-line
    result[scope] = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
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
    }).then((res) => res.json());
  }

  return { ok: true, result: result };
}

export function commandsDocument() {
  return Object.keys(commandHandlers).map((key) => {
    const command = commandHandlers[key];
    return {
      command: key,
      description: command.help,
    };
  });
}
