import * as Telegram from 'telegram-bot-api-types';

export {
    Telegram,
};

export interface TelegramAPISuccess<T> {
    ok: true;
    result: T;
}

export interface TelegramAPIError {
    ok: false;
    error_code: number;
    description: string;
}
