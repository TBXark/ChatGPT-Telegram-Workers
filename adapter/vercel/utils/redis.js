/* eslint-disable require-jsdoc */
export class RedisCache {
  constructor (baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  // upstash REST API
  async fetchFromRedis(endpoint, method = 'GET', body = null) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
    const options = {
      method,
      headers,
      ...(body && { body: body }),
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, options)
    if (!response.ok) {
      throw new Error(`Failed to fetch from Redis: ${response.error}`)
    }
    return response.json()
  }

  async get(key, info) {
    try {
      const raw = await this.fetchFromRedis(`get/${key}`)
      // console.log(raw)
      if (!raw) {
        return null
      }
      switch (info?.type || 'string') {
        case 'string':
          return raw.result
        case 'json':
          return JSON.parse(raw.result)
        case 'arrayBuffer':
          return new Uint8Array(raw).buffer
        default:
          return raw.result
      }
    } catch (error) {
      console.error(`Error getting key ${key}:`, error)
      return null
    }
  }

  async put(key, value, info) {
    let endpoint = `set/${key}`
    let expiration = -1
    if (info && info.expiration) {
      expiration = Math.round(info.expirationTtl)
    } else if (info && info.expirationTtl) {
      expiration = Math.round(Date.now() / 1000 + info.expirationTtl)
    }
    if (expiration > 0) {
      endpoint += `?exat=${expiration}`
    }
    await this.fetchFromRedis(endpoint, 'POST', value)
  }

  async delete(key) {
    await this.fetchFromRedis(`del/${key}`, 'POST')
  }
}