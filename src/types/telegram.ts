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

export interface TelegramChat {
    id: number;
    type: string;
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
}

export interface TelegramWebhookRequest {
    update_id: number;
    message: TelegramMessage;
    edited_message: TelegramMessage;
}

export const TelegramConstValue = {
    GROUP_TYPES: ['group', 'supergroup'],
};

