export interface TelegramBaseFile {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
}

export interface TelegramPhoto extends TelegramBaseFile {
    width: number;
    height: number;
}

export interface TelegramVoice extends TelegramBaseFile {
    duration: number;
    mime_type?: string;
}

export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export type TelegramChatType = 'private' | 'group' | 'supergroup' | 'channel';

export interface TelegramChat {
    id: number;
    type: TelegramChatType;
    is_forum: boolean;
    all_members_are_administrators: boolean;
}

export interface TelegramMessageEntity {
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: TelegramUser;
}

export interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    caption?: string;
    photo?: TelegramPhoto[];
    voice?: TelegramVoice;
    entities?: TelegramMessageEntity[];
    caption_entities?: TelegramMessageEntity[];
    reply_to_message?: TelegramMessage;
    is_topic_message: boolean;
    message_thread_id: string | number;
    reply_markup?: TelegramReplyKeyboardRemove | TelegramReplyKeyboardMarkup | null;
}

export interface TelegramReplyKeyboardRemove {
    remove_keyboard: true;
    selective?: boolean;
}

export interface TelegramReplyKeyboardMarkup {
    keyboard: string[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
}

export interface TelegramWebhookRequest {
    update_id: number;
    message: TelegramMessage;
    edited_message: TelegramMessage;
}

export interface TelegramAPISuccessResponse<T> {
    ok: true;
    result: T;
}

export interface TelegramAPIErrorResponse {
    ok: false;
    error_code: number;
    description: string;
}
