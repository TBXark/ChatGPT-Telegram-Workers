/**
 * @type {I18n}
 */
export default {
  env: {
    'system_init_message': '你是一个得力的助手',
  },
  utils: {
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
      'delenv': '删除用户配置，命令完整格式为 /delenv KEY',
      'usage': '获取当前机器人的用量统计',
      'system': '查看当前一些系统信息',
      'role': '设置预设的身份',
      'redo': '重做上一次的对话, /redo 加修改过的内容 或者 直接 /redo',
      'echo': '回显消息',
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
};
