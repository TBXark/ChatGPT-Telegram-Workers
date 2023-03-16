/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {CONST, DATABASE, ENV} from './env.js';
import {requestImageFromOpenAI} from './openai.js';
import {mergeConfig} from './utils.js';
import {
  getChatRoleWithContext,
  sendChatActionToTelegramWithContext,
  sendMessageToTelegramWithContext,
  sendPhotoToTelegramWithContext,
} from './telegram.js';


const commandAuthCheck = {
  default: function(chatType) {
    if (CONST.GROUP_TYPES.includes(chatType)) {
      return ['administrator', 'creator'];
    }
    return false;
  },
  shareModeGroup: function(chatType) {
    if (CONST.GROUP_TYPES.includes(chatType)) {
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
    help: '获取命令帮助',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandGetHelp,
  },
  '/new': {
    help: '发起新的对话',
    scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.shareModeGroup,
  },
  '/start': {
    help: '获取你的ID, 并发起新的对话',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandCreateNewChatContext,
    needAuth: commandAuthCheck.default,
  },
  '/img': {
    help: '生成一张图片, 命令完整格式为 `/img 图片描述`, 例如`/img 月光下的沙滩`',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandGenerateImg,
    needAuth: commandAuthCheck.shareModeGroup,
  },
  '/version': {
    help: '获取当前版本号, 判断是否需要更新',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandFetchUpdate,
    needAuth: commandAuthCheck.default,
  },
  '/setenv': {
    help: '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
    scopes: [],
    fn: commandUpdateUserConfig,
    needAuth: commandAuthCheck.shareModeGroup,
  },
  '/usage': {
    help: '获取当前机器人的用量统计',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandUsage,
    needAuth: commandAuthCheck.default,
  },
  '/system': {
    help: '查看当前一些系统信息',
    scopes: ['all_private_chats', 'all_chat_administrators'],
    fn: commandSystem,
    needAuth: commandAuthCheck.default,
  },
  '/role': {
    help: '设置预设的身份',
    scopes: ['all_private_chats'],
    fn: commandUpdateRole,
    needAuth: commandAuthCheck.shareModeGroup,
  },
};

/**
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandUpdateRole(message, command, subcommand, context) {
  // 显示
  if (subcommand==='show') {
    const size = Object.getOwnPropertyNames(context.USER_DEFINE.ROLE).length;
    if (size===0) {
      return sendMessageToTelegramWithContext(context)('还未定义任何角色');
    }
    let showMsg = `当前已定义的角色如下(${size}):\n`;
    for (const role in context.USER_DEFINE.ROLE) {
      if (context.USER_DEFINE.ROLE.hasOwnProperty(role)) {
        showMsg+=`~${role}:\n<pre>`;
        showMsg+=JSON.stringify(context.USER_DEFINE.ROLE[role])+'\n';
        showMsg+='</pre>';
      }
    }
    context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
    return sendMessageToTelegramWithContext(context)(showMsg);
  }

  const helpMsg = '格式错误: 命令完整格式为 `/role 操作`\n'+
      '当前支持以下`操作`:\n'+
      '`/role show` 显示当前定义的角色.\n'+
      '`/role 角色名 del` 删除指定名称的角色.\n'+
      '`/role 角色名 KEY=VALUE` 设置指定角色的配置.\n'+
      ' 目前以下设置项:\n'+
      '  `SYSTEM_INIT_MESSAGE`:初始化消息\n'+
      '  `OPENAI_API_EXTRA_PARAMS`:OpenAI API 额外参数，必须为JSON';

  const kv = subcommand.indexOf(' ');
  if (kv === -1) {
    return sendMessageToTelegramWithContext(context)(helpMsg);
  }
  const role = subcommand.slice(0, kv);
  const settings = subcommand.slice(kv + 1).trim();
  const skv = settings.indexOf('=');
  if (skv === -1) {
    if (settings === 'del') { // 删除
      try {
        if (context.USER_DEFINE.ROLE[role]) {
          delete context.USER_DEFINE.ROLE[role];
          await DATABASE.put(
              context.USER_DEFINE.configStoreKey,
              JSON.stringify(Object.assign(context.USER_DEFINE, {USER_DEFINE: context.USER_DEFINE})),
          );
          return sendMessageToTelegramWithContext(context)('删除角色成功');
        }
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(`删除角色错误: \`${e.message}\``);
      }
    }
    return sendMessageToTelegramWithContext(context)(helpMsg);
  }
  const key = settings.slice(0, skv);
  const value = settings.slice(skv + 1);

  // ROLE结构定义
  if (!context.USER_DEFINE.ROLE[role]) {
    context.USER_DEFINE.ROLE[role] = {
      // 系统初始化消息
      SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
      // OpenAI API 额外参数
      OPENAI_API_EXTRA_PARAMS: {},
    };
  }
  try {
    mergeConfig(context.USER_DEFINE.ROLE[role], key, value);
    await DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(Object.assign(context.USER_DEFINE, {USER_DEFINE: context.USER_DEFINE})),
    );
    return sendMessageToTelegramWithContext(context)('更新配置成功');
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`配置项格式错误: \`${e.message}\``);
  }
}

/**
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandGenerateImg(message, command, subcommand, context) {
  if (subcommand==='') {
    return sendMessageToTelegramWithContext(context)('请输入图片描述。命令完整格式为 \`/img 狸花猫\`');
  }
  try {
    setTimeout(() => sendChatActionToTelegramWithContext(context)('upload_photo').catch(console.error), 0);
    const imgUrl = await requestImageFromOpenAI(subcommand);
    try {
      return sendPhotoToTelegramWithContext(context)(imgUrl);
    } catch (e) {
      return sendMessageToTelegramWithContext(context)(`图片:\n${imgUrl}`);
    }
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`ERROR:IMG: ${e.message}`);
  }
}

/**
 * 获取帮助信息
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandGetHelp(message, command, subcommand, context) {
  const helpMsg =
      '当前支持以下命令:\n' +
      Object.keys(commandHandlers)
          .map((key) => `${key}：${commandHandlers[key].help}`)
          .join('\n');
  return sendMessageToTelegramWithContext(context)(helpMsg);
}

/**
 * 新的会话
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandCreateNewChatContext(message, command, subcommand, context) {
  try {
    await DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
    if (command === '/new') {
      return sendMessageToTelegramWithContext(context)('新的对话已经开始');
    } else {
      if (context.SHARE_CONTEXT.chatType==='private') {
        return sendMessageToTelegramWithContext(context)(
            `新的对话已经开始，你的ID(${context.CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      } else {
        return sendMessageToTelegramWithContext(context)(
            `新的对话已经开始，群组ID(${context.CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
  }
}


/**
 * 用户配置修改
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandUpdateUserConfig(message, command, subcommand, context) {
  const kv = subcommand.indexOf('=');
  if (kv === -1) {
    return sendMessageToTelegramWithContext(context)(
        '配置项格式错误: 命令完整格式为 /setenv KEY=VALUE',
    );
  }
  const key = subcommand.slice(0, kv);
  const value = subcommand.slice(kv + 1);
  try {
    mergeConfig(context.USER_CONFIG, key, value);
    await DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(context.USER_CONFIG),
    );
    return sendMessageToTelegramWithContext(context)('更新配置成功');
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`配置项格式错误: ${e.message}`);
  }
}


/**
 * 获得更新信息
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandFetchUpdate(message, command, subcommand, context) {
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
    online = await fetch(ts, config).then((r) => r.text())
        .then((ts) => ({ts: Number(ts.trim()), sha: 'unknown'}))
        .catch(() => ({ts: 0, sha: 'unknown'}));
  }

  if (current.ts < online.ts) {
    return sendMessageToTelegramWithContext(context)(
        ` 发现新版本，当前版本: ${JSON.stringify(current)}，最新版本: ${JSON.stringify(online)}`,
    );
  } else {
    return sendMessageToTelegramWithContext(context)(`当前已经是最新版本, 当前版本: ${JSON.stringify(current)}`);
  }
}


/**
 * 获得使用统计
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandUsage(message, command, subcommand, context) {
  if (!ENV.ENABLE_USAGE_STATISTICS) {
    return sendMessageToTelegramWithContext(context)('当前机器人未开启用量统计');
  }
  const usage = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.usageKey));
  let text = '📊 当前机器人用量\n\nTokens:\n';
  if (usage?.tokens) {
    const {tokens} = usage;
    const sortedChats = Object.keys(tokens.chats || {}).sort((a, b) => tokens.chats[b] - tokens.chats[a]);

    text += `- 总用量：${tokens.total || 0} tokens\n- 各聊天用量：`;
    for (let i = 0; i < Math.min(sortedChats.length, 30); i++) {
      text += `\n  - ${sortedChats[i]}: ${tokens.chats[sortedChats[i]]} tokens`;
    }
    if (sortedChats.length === 0) {
      text += '0 tokens';
    } else if (sortedChats.length > 30) {
      text += '\n  ...';
    }
  } else {
    text += '- 暂无用量';
  }
  return sendMessageToTelegramWithContext(context)(text);
}


/**
 * 获得系统信息
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandSystem(message, command, subcommand, context) {
  let msg = '当前系统信息如下:\n';
  msg+='OpenAI模型:'+ENV.CHAT_MODEL+'\n';
  if (ENV.DEBUG_MODE) {
    msg+='<pre>';
    msg+=`USER_CONFIG: \n${JSON.stringify(context.USER_CONFIG, null, 2)}\n`;
    if (ENV.DEV_MODE) {
      const shareCtx = {...context.SHARE_CONTEXT};
      shareCtx.currentBotToken = '******';
      msg +=`CHAT_CONTEXT: \n${JSON.stringify(context.CURRENT_CHAT_CONTEXT, null, 2)}\n`;
      msg += `SHARE_CONTEXT: \n${JSON.stringify(shareCtx, null, 2)}\n`;
    }
    msg+='</pre>';
  }
  context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
  return sendMessageToTelegramWithContext(context)(msg);
}


/**
 * 回显消息
 *
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {Context} context
 * @return {Promise<Response>}
 */
async function commandEcho(message, command, subcommand, context) {
  let msg = '<pre>';
  msg += JSON.stringify({message}, null, 2);
  msg += '</pre>';
  context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
  return sendMessageToTelegramWithContext(context)(msg);
}

/**
 * 处理命令消息
 *
 * @param {TelegramMessage} message
 * @param {Context} context
 * @return {Promise<Response>}
 */
export async function handleCommandMessage(message, context) {
  if (ENV.DEV_MODE) {
    commandHandlers['/echo'] = {
      help: '[DEBUG ONLY]回显消息',
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
          const roleList = command.needAuth(context.SHARE_CONTEXT.chatType);
          if (roleList) {
            // 获取身份并判断
            const chatRole = await getChatRoleWithContext(context)(context.SHARE_CONTEXT.speakerId);
            if (chatRole === null) {
              return sendMessageToTelegramWithContext(context)('身份权限验证失败');
            }
            if (!roleList.includes(chatRole)) {
              return sendMessageToTelegramWithContext(context)(`权限不足,需要${roleList.join(',')},当前:${chatRole}`);
            }
          }
        }
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(`身份验证出错:` + e.message);
      }
      const subcommand = message.text.substring(key.length).trim();
      try {
        return await command.fn(message, key, subcommand, context);
      } catch (e) {
        return sendMessageToTelegramWithContext(context)(`命令执行错误: ${e.message}`);
      }
    }
  }
  return null;
}

/**
 *
 * @param {string} token
 * @return {Promise<{result: {}, ok: boolean}>}
 */
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

/**
 * 获取所有命令的描述
 * @return {{description: *, command: *}[]}
 */
export function commandsDocument() {
  return Object.keys(commandHandlers).map((key) => {
    const command = commandHandlers[key];
    return {
      command: key,
      description: command.help,
    };
  });
}
