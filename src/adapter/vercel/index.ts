import * as process from 'node:process';
import { RedisCache } from 'cloudflare-worker-adapter/cache/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ENV } from '../../config/env';
import { createRouter } from '../../route';

export default async function (request: VercelRequest, response: VercelResponse) {
    let redis: RedisCache | null = null;
    try {
        const {
            VERCEL_DOMAIN,
            REDIS_URL,
        } = process.env;
        if (!VERCEL_DOMAIN) {
            response.status(500).send('VERCEL_DOMAIN is required');
            return;
        }
        if (!REDIS_URL) {
            response.status(500).send('REDIS_URL is required');
            return;
        }
        const cache = RedisCache.createFromUri(REDIS_URL);
        // edge function 使用 redis 作为数据库容易出现连接数过多的问题，此处仅作为演示，请自行实现 `Cache` 接口
        redis = cache;
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
        if (redis) {
            await redis.close().catch(console.error);
            redis = null;
        }
        response.status(res.status).send(await res.text());
    } catch (e) {
        if (redis) {
            await redis.close();
        }
        response.status(500).send(JSON.stringify({
            message: (e as Error).message,
            stack: (e as Error).stack,
        }, null, 2));
    }
}
