import type * as Telegram from 'telegram-bot-api-types';
import { ENV } from '../../config/env';

class APIClientBase {
    readonly token: string;
    readonly baseURL: string = ENV.TELEGRAM_API_DOMAIN;

    constructor(token: string, baseURL?: string) {
        this.token = token;
        if (baseURL) {
            this.baseURL = baseURL;
        }
        while (this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL.slice(0, -1);
        }
        this.request = this.request.bind(this);
        this.requestJSON = this.requestJSON.bind(this);
    }

    private uri(method: Telegram.BotMethod): string {
        return `${this.baseURL}/bot${this.token}/${method}`;
    }

    private jsonRequest<T>(method: Telegram.BotMethod, params: T): Promise<Response> {
        return fetch(this.uri(method), {
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
        return fetch(this.uri(method), {
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

    async requestJSON<T, R>(method: Telegram.BotMethod, params: T): Promise<R> {
        return this.request(method, params).then(res => res.json() as R);
    }
}

export type TelegramBotAPI = APIClientBase & Telegram.AllBotMethods;

export function createTelegramBotAPI(token: string): TelegramBotAPI {
    const client = new APIClientBase(token);
    return new Proxy(client, {
        get(target, prop, receiver) {
            if (prop in target) {
                return Reflect.get(target, prop, receiver);
            }
            return (...args: any[]) => {
                if (typeof prop === 'string' && prop.endsWith('WithReturns')) {
                    const method = prop.slice(0, -11) as Telegram.BotMethod;
                    return Reflect.apply(target.requestJSON, target, [method, ...args]);
                }
                return Reflect.apply(target.request, target, [prop as Telegram.BotMethod, ...args]);
            };
        },
    }) as TelegramBotAPI;
}
