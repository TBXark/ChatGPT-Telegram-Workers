import type { Telegram } from '../../types/telegram';

export class TelegramBotAPI implements
    Telegram.SendMessageRequest,
    Telegram.EditMessageTextRequest,
    Telegram.SendPhotoRequest,
    Telegram.SendChatActionRequest,
    Telegram.SetWebhookRequest,
    Telegram.DeleteWebhookRequest,
    Telegram.SetMyCommandsRequest,
    Telegram.GetMeRequest,
    Telegram.GetFileRequest,
    Telegram.GetChatAdministratorsRequest,
    Telegram.GetUpdatesRequest {
    readonly token: string;
    readonly baseURL: string = `https://api.telegram.org/`;

    constructor(token: string, baseURL?: string) {
        this.token = token;
        if (baseURL) {
            this.baseURL = baseURL;
        }
    }

    static from(token: string, baseURL?: string): TelegramBotAPI {
        return new TelegramBotAPI(token, baseURL);
    }

    jsonRequest<T>(method: Telegram.TelegramBotMethod, params: T): Promise<Response> {
        return fetch(`${this.baseURL}bot${this.token}/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
    }

    formDataRequest<T>(method: Telegram.TelegramBotMethod, params: T): Promise<Response> {
        const formData = new FormData();
        for (const key in params) {
            const value = params[key];
            if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (value instanceof Blob) {
                formData.append(key, value, 'blob');
            } else if (typeof value === 'string') {
                formData.append(key, value);
            } else {
                formData.append(key, JSON.stringify(value));
            }
        }
        return fetch(`${this.baseURL}bot${this.token}/${method}`, {
            method: 'POST',
            body: formData,
        });
    }

    sendMessage(params: Telegram.SendMessageParams): Promise<Response> {
        return this.jsonRequest('sendMessage', params);
    }

    editMessageText(params: Telegram.EditMessageTextParams): Promise<Response> {
        return this.jsonRequest('editMessageText', params);
    }

    sendPhoto(params: Telegram.SendPhotoParams): Promise<Response> {
        return this.formDataRequest('sendPhoto', params);
    }

    sendChatAction(params: Telegram.SendChatActionParams): Promise<Response> {
        return this.jsonRequest('sendChatAction', params);
    }

    setWebhook(params: Telegram.SetWebhookParams): Promise<Response> {
        return this.jsonRequest('setWebhook', params);
    }

    deleteWebhook(): Promise<Response> {
        return this.jsonRequest('deleteWebhook', {});
    }

    setMyCommands(params: Telegram.SetMyCommandsParams): Promise<Response> {
        return this.jsonRequest('setMyCommands', params);
    }

    getMe(): Promise<Response> {
        return this.jsonRequest('getMe', {});
    }

    getFile(params: Telegram.GetFileParams): Promise<Response> {
        return this.jsonRequest('getFile', params);
    }

    getChatAdministrators(params: Telegram.GetChatAdministratorsParams): Promise<Response> {
        return this.jsonRequest('getChatAdministrators', params);
    }

    getUpdates(params: Telegram.GetUpdatesParams): Promise<Response> {
        return this.jsonRequest('getUpdates', params);
    }
}
