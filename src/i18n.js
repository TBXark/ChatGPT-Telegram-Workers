

const i18n = {
  'zh-cn': {
    uitls: {
      'not_supported_configuration': '不支持的配置项或数据类型错误',
    },
    message: {
      'not_supported_chat_type': (type) => `暂不支持${type}类型的聊天`,
      'not_supported_chat_type_message': '暂不支持非文本格式消息',
      'handle_chat_type_message_error': (type) => `处理${type}类型的聊天消息出错`,
      'user_has_no_permission_to_use_the_bot': (id) => `你没有权限使用这个bot, 请请联系管理员添加你的ID(${id})到白名单`,
      'group_has_no_permission_to_use_the_bot': (id) => `该群未开启聊天权限, 请请联系管理员添加群ID(${id})到白名单`,
    },
    command: {
      help: {
        'summary': '当前支持以下命令:\n',
        'help': '获取命令帮助',
        'new': '发起新的对话',
        'start': '获取你的ID, 并发起新的对话',
        'img': '生成一张图片, 命令完整格式为 `/img 图片描述`, 例如`/img 月光下的沙滩`',
        'version': '获取当前版本号, 判断是否需要更新',
        'setenv': '设置用户配置，命令完整格式为 /setenv KEY=VALUE',
        'usage': '获取当前机器人的用量统计',
        'system': '查看当前一些系统信息',
        'role': '设置预设的身份',
      },
      role: {
        'not_defined_any_role': '还未定义任何角色',
        'current_defined_role': (size) => `当前已定义的角色如下(${size}):\n`,
        'help': '格式错误: 命令完整格式为 `/role 操作`\n'+
        '当前支持以下`操作`:\n'+
        ' `/role show` 显示当前定义的角色.\n'+
        ' `/role 角色名 del` 删除指定名称的角色.\n'+
        ' `/role 角色名 KEY=VALUE` 设置指定角色的配置.\n'+
        '  目前以下设置项:\n'+
        '   `SYSTEM_INIT_MESSAGE`:初始化消息\n'+
        '   `OPENAI_API_EXTRA_PARAMS`:OpenAI API 额外参数，必须为JSON',
        'delete_role_success': '删除角色成功',
        'delete_role_error': (e) => `删除角色错误: \`${e.message}\``,
        'update_role_success': '更新配置成功',
        'update_role_error': (e) => `配置项格式错误: \`${e.message}\``,
      },
      img: {
        'help': '请输入图片描述。命令完整格式为 \`/img 狸花猫\`',
      },
      new: {
        'new_chat_start': '新的对话已经开始',
        'new_chat_start_private': (id) => `新的对话已经开始，你的ID(${id})`,
        'new_chat_start_group': (id) => `新的对话已经开始，群组ID(${id})`,
      },
      setenv: {
        'help': '配置项格式错误: 命令完整格式为 /setenv KEY=VALUE',
        'update_config_success': '更新配置成功',
        'update_config_error': (e) => `配置项格式错误: ${e.message}`,
      },
      version: {
        'new_version_found': (current, online) => `发现新版本，当前版本: ${JSON.stringify(current)}，最新版本: ${JSON.stringify(online)}`,
        'current_is_latest_version': (current) => `当前已经是最新版本, 当前版本: ${JSON.stringify(current)}`,
      },
      usage: {
        'usage_not_open': '当前机器人未开启用量统计',
        'current_usage': '📊 当前机器人用量\n\nTokens:\n',
        'total_usage': (total) => `- 总用量：${total || 0} tokens\n- 各聊天用量：`,
        'no_usage': '- 暂无用量',
      },
      permission: {
        'not_authorized': '身份权限验证失败',
        'not_enough_permission': (roleList, chatRole) => `权限不足,需要${roleList.join(',')},当前:${chatRole}`,
        'role_error': (e) => `身份验证出错:` + e.message,
        'command_error': (e) => `命令执行错误: ${e.message}`,
      },
    },
  },
};

i18n.cn = i18n['zh-cn'];

i18n.en = {
  uitls: {
    'not_supported_configuration': 'Not supported configuration or data type error',
  },
  message: {
    'not_supported_chat_type': (type) => `Currently not supported ${type} type of chat`,
    'not_supported_chat_type_message': 'Currently not supported non-text format messages',
    'handle_chat_type_message_error': (type) => `Error handling ${type} type of chat messages`,
    'user_has_no_permission_to_use_the_bot': (id) => `You do not have permission to use this bot, please contact the administrator to add your ID (${id}) to the whitelist`,
    'group_has_no_permission_to_use_the_bot': (id) => `The group has not enabled chat permissions, please contact the administrator to add the group ID (${id}) to the whitelist`,
  },
  command: {
    help: {
      'summary': 'The following commands are currently supported:\n',
      'help': 'Get command help',
      'new': 'Start a new conversation',
      'start': 'Get your ID and start a new conversation',
      'img': 'Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`',
      'version': 'Get the current version number to determine whether to update',
      'setenv': 'Set user configuration, the complete command format is /setenv KEY=VALUE',
      'usage': 'Get the current usage statistics of the robot',
      'system': 'View some system information',
      'role': 'Set the preset identity',
    },
    role: {
      'not_defined_any_role': 'No roles have been defined yet',
      'current_defined_role': (size) => `The following roles are currently defined (${size}):\n`,
      'help': 'Format error: the complete command format is `/role operation`\n' +
                'The following `operation` is currently supported:\n' +
                ' `/role show` Display the currently defined roles.\n' +
                ' `/role role name del` Delete the specified role.\n' +
                ' `/role role name KEY=VALUE` Set the configuration of the specified role.\n' +
                '  The following settings are currently supported:\n' +
                '   `SYSTEM_INIT_MESSAGE`: Initialization message\n' +
                '   `OPENAI_API_EXTRA_PARAMS`: OpenAI API extra parameters, must be JSON',
      'delete_role_success': 'Delete role successfully',
      'delete_role_error': (e) => `Delete role error: \`${e.message}\``,
      'update_role_success': 'Update configuration successfully',
      'update_role_error': (e) => `Configuration item format error: \`${e.message}\``,
    },
    img: {
      'help': 'Please enter the image description. The complete command format is `/img raccoon cat`',
    },
    new: {
      'new_chat_start': 'A new conversation has started',
      'new_chat_start_private': (id) => `A new conversation has started, your ID (${id})`,
      'new_chat_start_group': (id) => `A new conversation has started, group ID (${id})`,
    },
    setenv: {
      'help': 'Configuration item format error: the complete command format is /setenv KEY=VALUE',
      'update_config_success': 'Update configuration successfully',
      'update_config_error': (e) => `Configuration item format error: ${e.message}`,
    },
    version: {
      'new_version_found': (current, online) => `New version found, current version: ${JSON.stringify(current)}, latest version: ${JSON.stringify(online)}`,
      'current_is_latest_version': (current) => `Current is the latest version, current version: ${JSON.stringify(current)}`,
    },
    usage: {
      'usage_not_open': 'The current robot is not open for usage statistics',
      'current_usage': '📊 Current robot usage\n\nTokens:\n',
      'total_usage': (total) => `- Total: ${total || 0} tokens\n- Per chat usage: `,
      'no_usage': '- No usage',
    },
    permission: {
      'not_authorized': 'Identity permission verification failed',
      'not_enough_permission': (roleList, chatRole) => `Insufficient permissions, need ${roleList.join(',')}, current: ${chatRole}`,
      'role_error': (e) => `Identity verification error: ` + e.message,
      'command_error': (e) => `Command execution error: ${e.message}`,
    },
  },
};

export default i18n;
