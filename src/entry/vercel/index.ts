import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as process from 'node:process';
import { UpStashRedis } from 'cloudflare-worker-adapter/cache/upstash';
import { ENV } from '../../config/env';
import { createRouter } from '../../route';

export default async function (request: VercelRequest, response: VercelResponse) {
    try {
        const {
            UPSTASH_REDIS_REST_URL,
            UPSTASH_REDIS_REST_TOKEN,
            VERCEL_DOMAIN,
        } = process.env;
        if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
            response.status(500).send('UPSTASH_REDIS_REST_TOKEN and UPSTASH_REDIS_REST_URL  are required');
            return;
        }
        if (!VERCEL_DOMAIN) {
            response.status(500).send('VERCEL_DOMAIN is required');
            return;
        }
        const cache = UpStashRedis.create(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN);
        ENV.merge({
            ...process.env,
            DATABASE: cache,
        });
        const router = createRouter();
        let body: BodyInit | null = null;
        if (request.body) {
            body = JSON.stringify(request.body);
        }
        const newReq = new Request(VERCEL_DOMAIN + request.url, {
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
        response.status(res.status).send(await res.text());
    } catch (e) {
        response.status(500).send(JSON.stringify({
            message: (e as Error).message,
            stack: (e as Error).stack,
        }, null, 2));
    }
}
