import worker from 'chatgpt-telegram-workers';
import { RedisCache } from 'cloudflare-worker-adapter/cache/redis';

export default async (req, res) => {
    try {
        const env = {
            ...Object.assign({}, process.env),
        };
        const domain = env.VERCEL_DOMAIN;
        if (!domain) {
            res.status(500).send('VERCEL_DOMAIN not set, Please set it in Vercel environment variables and redeploy');
        }
        const redis = RedisCache.createFromUri(process.env.REDIS_URL);
        env.DATABASE = redis;
        const cfReq = new Request(domain + req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(req.body),
        });
        const resp = await worker.fetch(cfReq, env);
        await redis.close();
        res.status(resp.status);
        for (const [key, value] of resp.headers) {
            res.setHeader(key, value);
        }
        res.send(await resp.text());
    } catch (e) {
        res.status(500).send(JSON.stringify({
            message: e.message,
            stack: e.stack,
        }, null, 2));
    }
};
