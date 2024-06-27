/**
 * @typedef {Object} I18n
 *
 * @property {string} env.system_init_message
 *
 * @property {string} utils.not_supported_configuration
 *
 * @property {string} message.loading
 * @property {function} message.not_supported_chat_type
 * @property {string} message.not_supported_chat_type_message
 * @property {function} message.handle_chat_type_message_error
 * @property {function} message.user_has_no_permission_to_use_the_bot
 * @property {function} message.group_has_no_permission_to_use_the_bot
 * @property {string} message.history_empty
 *
 * @property {string} command.help.summary
 * @property {string} command.help.help
 * @property {string} command.help.new
 * @property {string} command.help.start
 * @property {string} command.help.img
 * @property {string} command.help.version
 * @property {string} command.help.setenv
 * @property {string} command.help.setenvs
 * @property {string} command.help.delenv
 * @property {string} command.help.usage
 * @property {string} command.help.system
 * @property {string} command.help.redo
 * @property {string} command.help.echo
 * @property {string} command.help.bill
 *
 * @property {string} command.img.help
 *
 * @property {string} command.new.new_chat_start
 * @property {function} command.new.new_chat_start_private
 * @property {function} command.new.new_chat_start_group
 *
 * @property {string} command.setenv.help
 * @property {string} command.setenv.update_config_success
 * @property {function} command.setenv.update_config_error
 *
 * @property {function} command.version.new_version_found
 * @property {function} command.version.current_is_latest_version
 *
 * @property {string} command.usage.usage_not_open
 * @property {string} command.usage.current_usage
 * @property {function} command.usage.total_usage
 * @property {string} command.usage.no_usage
 *
 * @property {string} command.permission.not_authorized
 * @property {function} command.permission.not_enough_permission
 * @property {function} command.permission.role_error
 * @property {function} command.permission.command_error
 *
 * @property {function} command.bill.bill_detail
 */

/**
 * @callback I18nGenerator
 * @param {string} lang
 * @return {I18n}
 */
