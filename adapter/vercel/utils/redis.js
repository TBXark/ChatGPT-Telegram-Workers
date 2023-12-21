/* eslint-disable require-jsdoc */
import Redis from 'ioredis'

export class RedisCache {
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
