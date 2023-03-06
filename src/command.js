import {getChatRole, sendMessageToTelegram} from './telegram.js';
import {DATABASE} from './env.js';
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
      if (CURRENT_CHAT_CONTEXT.reply_to_message_id) {
        return sendMessageToTelegram(
            `新的对话已经开始，群组ID(${CURRENT_CHAT_CONTEXT.chat_id})，你的ID(${message.from.id})`,
        );
      } else {
        return sendMessageToTelegram(
            `新的对话已经开始，你的ID(${CURRENT_CHAT_CONTEXT.chat_id})`,
        );
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`ERROR: ${e.message}`);
  }
}

// 用户配置修改
async function commandUpdateUserConfig(message, command, subcommand) {
  try {
    if (CURRENT_CHAT_CONTEXT.reply_to_message_id) {
      const chatRole = await getChatRole(message.from.id);
      if (chatRole === null) {
        return sendMessageToTelegram('身份权限验证失败');
      }
      if (chatRole !== 'administrator' && chatRole !== 'creator') {
        return sendMessageToTelegram('你不是管理员，无权操作');
      }
    }
  } catch (e) {
    return sendMessageToTelegram(`身份验证出错:` + JSON.stringify(e));
  }
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


export async function handleCommandMessage(message) {
  for (const key in commandHandlers) {
    if (message.text === key || message.text.startsWith(key + ' ')) {
      const command = commandHandlers[key];
      const subcommand = message.text.substring(key.length).trim();
      return await command.fn(message, key, subcommand);
    }
  }
  return null;
}
