/* eslint-disable  */

type TelegramWebhookRequest = {
    update_id: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
}

type TelegramMessage = {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text: string;
  entities?: TelegramMessageEntity[];
  reply_to_message?: TelegramMessage;
}

type TelegramUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

type TelegramChat = {
  id: number;
  type: string;
}

type TelegramMessageEntity = {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export { TelegramWebhookRequest, TelegramMessage, TelegramUser, TelegramChat, TelegramMessageEntity };
