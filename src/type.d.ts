/* eslint-disable  */

interface I18n {
    env: {
        'system_init_message': string;
    }
    utils: {
        'not_supported_configuration': string;
    }
    message: {
        'not_supported_chat_type': (type: string) => string;
        'not_supported_chat_type_message': string;
        'handle_chat_type_message_error': (type: string) => string;
        'user_has_no_permission_to_use_the_bot': (id: number) => string;
        'group_has_no_permission_to_use_the_bot': (id: number) => string;
    }
    command: {
        help: {
            'summary': string;
            'help': string;
            'new': string;
            'start': string;
            'img': string;
            'version': string;
            'setenv': string;
            'delenv': string;
            'usage': string;
            'system': string;
            'role': string;
            'echo': string;
        }
        role: {
            'not_defined_any_role': string;
            'current_defined_role': (size: number) => string;
            'help': string;
            'delete_role_success': string;
            'delete_role_error': (e: Error) => string;
            'update_role_success': string;
            'update_role_error': (e: Error) => string;
        }
        img: {
            'help': string;
        }
        new: {
            'new_chat_start': string;
            'new_chat_start_private': (id: number) => string;
            'new_chat_start_group': (id: number) => string;
        }
        setenv: {
            'help': string;
            'update_config_success': string;
            'update_config_error': (e: Error) => string;
        }
        version: {
            'new_version_found': (current: object, online: object) => string;
            'current_is_latest_version': (current: object) => string;
        }
        usage: {
            'usage_not_open': string;
            'current_usage': string;
            'total_usage': (total: number) => string;
            'no_usage': string;
        }
        permission: {
            'not_authorized': string;
            'not_enough_permission': (roleList: string[], chatRole: string) => string;
            'role_error': (e: Error) => string;
            'command_error': (e: Error) => string;
        }
    }
}

interface TelegramWebhookRequest {
    update_id: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text: string;
  entities?: TelegramMessageEntity[];
  reply_to_message?: TelegramMessage;
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramChat {
  id: number;
  type: string;
}

interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export { TelegramWebhookRequest, TelegramMessage, TelegramUser, TelegramChat, TelegramMessageEntity };
