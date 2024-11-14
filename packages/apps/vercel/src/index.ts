import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as process from 'node:process';
import { createRouter, ENV } from '@chatgpt-telegram-workers/core';
import { UpStashRedis } from 'cloudflare-worker-adapter';

export default async function (request: VercelRequest, response: VercelResponse) {
    try {
        const {
            UPSTASH_REDIS_REST_URL = '',
            UPSTASH_REDIS_REST_TOKEN = '',
            VERCEL_PROJECT_PRODUCTION_URL = '',
        } = process.env;
        for (const [KEY, VALUE] of Object.entries({ UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN })) {
            if (!VALUE) {
                response.status(500).json({
                    error: `${KEY} is required`,
                    message: 'Set environment variables and redeploy',
                });
                return;
            }
        }
        const cache = UpStashRedis.create(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN);
        ENV.merge({
            ...process.env,
            DATABASE: cache,
        });
        const router = createRouter();
        let body: any | null = null;
        if (request.body) {
            body = JSON.stringify(request.body);
        }
        if (request.url === '/vercel/debug') {
            response.status(200).json({
                message: 'OK',
                base: VERCEL_PROJECT_PRODUCTION_URL,
            });
            return;
        }
        const url = `https://${VERCEL_PROJECT_PRODUCTION_URL}${request.url}`;
        console.log(`Forwarding request to ${url}`);
        const newReq = new Request(url, {
            method: request.method,
            headers: Object.entries(request.headers).reduce((acc, [key, value]) => {
                if (value === undefined) {
                    return acc;
                }
                if (Array.isArray(value)) {
                    for (const v of value) {
                        acc.append(key, v);
                    }
                    return acc;
                }
                acc.set(key, value);
                return acc;
            }, new Headers()),
            body,
        });
        const res = await router.fetch(newReq);
        for (const [key, value] of res.headers.entries()) {
            response.setHeader(key, value);
        }
        response.status(res.status).send(await res.text());
    } catch (e) {
        response.status(500).json({
            message: (e as Error).message,
            stack: (e as Error).stack,
        });
    }
}
