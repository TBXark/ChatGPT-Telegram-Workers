/* eslint-disable require-jsdoc */
import worker from '../../../main.js'
import { RedisCache } from '../utils/redis.js'

export const config = {
  runtime: 'edge',
}

// cloudflare to vercel adapter
export default async (req, res) => {
  console.log(`${req.method} ${req.url}`)
  const redis = new RedisCache(process.env.REDIS_URL, process.env.REDIS_TOKEN)
  const env = {
    ...Object.assign({}, process.env),
    DATABASE: redis,
  }
  const domain = env.VERCEL_DOMAIN
  const cfReq = new Request(domain + req.url, {
    method: req.method,
    headers: req.headers,
    ...(req.body && { body: JSON.stringify(req.body) })
  })
  const controller = new AbortController()
  const signal = controller.signal
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 60 * 1000)

  let resp
  try {
    resp = await worker.fetch(cfReq, env, { signal })
  } catch (error) {
    resp = new Response('Request timed out', { status: 408 })
  } finally {
    clearTimeout(timeoutId)
    res.status(resp.status)
    resp.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    res.send(await resp.text())
  }
}
