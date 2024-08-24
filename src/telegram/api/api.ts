import type { Telegram } from '../../types/telegram';

class APIClientBase {
    readonly token: string;
    readonly baseURL: string = `https://api.telegram.org/`;
    constructor(token: string, baseURL?: string) {
        this.token = token;
        if (baseURL) {
            this.baseURL = baseURL;
        }
    }

    private jsonRequest<T>(method: Telegram.BotMethod, params: T): Promise<Response> {
        return fetch(`${this.baseURL}bot${this.token}/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
    }

    private formDataRequest<T>(method: Telegram.BotMethod, params: T): Promise<Response> {
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

    request<T>(method: Telegram.BotMethod, params: T): Promise<Response> {
        for (const key in params) {
            if (params[key] instanceof File || params[key] instanceof Blob) {
                return this.formDataRequest(method, params);
            }
        }
        return this.jsonRequest(method, params);
    }
}

export type TelegramBotAPI = APIClientBase &
    Telegram.SendMessageRequest &
    Telegram.EditMessageTextRequest &
    Telegram.SendPhotoRequest &
    Telegram.SendChatActionRequest &
    Telegram.SetWebhookRequest &
    Telegram.DeleteWebhookRequest &
    Telegram.SetMyCommandsRequest &
    Telegram.GetMeRequest &
    Telegram.GetFileRequest &
    Telegram.GetChatAdministratorsRequest &
    Telegram.GetUpdatesRequest;

export function createTelegramBotAPI(token: string): TelegramBotAPI {
    const client = new APIClientBase(token);
    return new Proxy(client, {
        get(target, prop, receiver) {
            if (prop in target) {
                return Reflect.get(target, prop, receiver);
            }
            return (...args: any[]) => {
                return target.request(prop as Telegram.BotMethod, args[0]);
            };
        },
    }) as TelegramBotAPI;
}
