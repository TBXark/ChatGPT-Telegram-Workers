/**
 * @type {I18n}
 */
export default {
  env: {
    'system_init_message': '你是一個得力的助手',
  },
  utils: {
    'not_supported_configuration': '不支持的配置或數據類型錯誤',
  },
  message: {
    'loading': '加载中',
    'not_supported_chat_type': (type) => `當前不支持${type}類型的聊天`,
    'not_supported_chat_type_message': '當前不支持非文本格式消息',
    'handle_chat_type_message_error': (type) => `處理${type}類型的聊天消息出錯`,
    'user_has_no_permission_to_use_the_bot': (id) => `您沒有權限使用本機器人，請聯繫管理員將您的ID(${id})添加到白名單中`,
    'group_has_no_permission_to_use_the_bot': (id) => `該群組未開啟聊天權限，請聯繫管理員將該群組ID(${id})添加到白名單中`,
    'history_empty': '暫無歷史消息',
  },
  command: {
    help: {
      'summary': '當前支持的命令如下：\n',
      'help': '獲取命令幫助',
      'new': '開始一個新對話',
      'start': '獲取您的ID並開始一個新對話',
      'img': '生成圖片，完整命令格式為`/img 圖片描述`，例如`/img 海灘月光`',
      'version': '獲取當前版本號確認是否需要更新',
      'setenv': '設置用戶配置，完整命令格式為/setenv KEY=VALUE',
      'setenvs': '批量設置用户配置, 命令完整格式為 /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}',
      'delenv': '刪除用戶配置，完整命令格式為/delenv KEY',
      'clearenv': '清除所有用戶配置',
      'usage': '獲取機器人當前的使用情況統計',
      'system': '查看一些系統信息',
      'redo': '重做上一次的對話 /redo 加修改過的內容 或者 直接 /redo',
      'echo': '回显消息',
      'bill': '查看當前的賬單',
    },
    img: {
      'help': '請輸入圖片描述。完整命令格式為`/img raccoon cat`',
    },
    new: {
      'new_chat_start': '開始一個新對話',
      'new_chat_start_private': (id) => `開始一個新對話，您的ID(${id})`,
      'new_chat_start_group': (id) => `開始一個新對話，群組ID(${id})`,
    },
    setenv: {
      'help': '配置項格式錯誤：完整命令格式為/setenv KEY=VALUE',
      'update_config_success': '更新配置成功',
      'update_config_error': (e) => `配置項格式錯誤：\`${e.message}\``,
    },
    version: {
      'new_version_found': (current, online) => `發現新版本，當前版本：${JSON.stringify(current)}，最新版本：${JSON.stringify(online)}`,
      'current_is_latest_version': (current) => `當前已是最新版本，當前版本：${JSON.stringify(current)}`,
    },
    usage: {
      'usage_not_open': '當前機器人未開啟使用情況統計',
      'current_usage': '📊 當前機器人使用情況\n\n使用情況：\n',
      'total_usage': (total) => `- 總計：${total || 0} 次\n- 每個群組使用情況： `,
      'no_usage': '- 暫無使用情況',
    },
    permission: {
      'not_authorized': '身份權限驗證失敗',
      'not_enough_permission': (roleList, chatRole) => `權限不足，需要${roleList.join(',')}，當前：${chatRole}`,
      'role_error': (e) => `身份驗證出錯：` + e.message,
      'command_error': (e) => `命令執行出錯：${e.message}`,
    },
    bill: {
      'bill_detail': (totalAmount, totalUsage, remaining) => `📊 本月机器人用量\n\n\t- 总额度: $${totalAmount || 0}\n\t- 已使用: $${totalUsage || 0}\n\t- 剩余额度: $${remaining || 0}`,
    },
  },
};
