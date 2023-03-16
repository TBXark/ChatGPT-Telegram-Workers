import worker from 'chatgpt-telegram-workers'
import Redis from 'ioredis'
import fetch from 'node-fetch'

global.fetch = fetch

class RedisCache {
    constructor(url) {
        this.redis = new Redis(url)
    }

    async get(key, info) {
        const raw = await this.redis.get(key)
        if (!raw) {
            return null
        }
        switch (info?.type || 'string') {
            case 'string':
                return raw
            case 'json':
                return JSON.parse(raw)
            case 'arrayBuffer':
                return new Uint8Array(raw).buffer
            default:
                return raw
        }
    }

    async put(key, value, info) {
        let expiration = -1
        if (info && info.expiration) {
            expiration = Math.round(info.expiration)
        } else if (info && info.expirationTtl) {
            expiration = Math.round(Date.now() + info.expirationTtl * 1000)
        }
        if (expiration > 0) {
            await this.redis.set(key, value, 'PX', expiration)
        } else {
            await this.redis.set(key, value)
        }
    }

    async delete(key) {
        await this.redis.del(key)
    }

    close() {
        this.redis.disconnect()
    }
}

// cloudflare to vercel adapter
export default async (req, res) => {
    console.log(`${req.method} ${req.url}`)
    const redis = new RedisCache(process.env.REDIS_URL)
    const env = {
        ...Object.assign({}, process.env),
        DATABASE: redis,
    }
    const domain = env.DOMAIN
    const cfReq = new Request(domain + req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
    })
    const resp = await worker.fetch(cfReq, env)
    redis.close()
    res.status(resp.status)
    for (const [key, value] of resp.headers) {
        res.setHeader(key, value)
    }
    res.send(await resp.text())
}