import worker from '../../../main.js'
import { RedisCache } from '../utils/redis.js'

export const config = {
  runtime: 'edge',
}

// cloudflare to vercel adapter
export default async (req, res) => {
  const redis = new RedisCache(process.env.REDIS_URL, process.env.REDIS_TOKEN)
  const env = {
    ...Object.assign({}, process.env),
    DATABASE: redis,
  }
  const body = await req.text()
  const cfReq = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    ...(body && { body }),
  })

  const controller = new AbortController()
  const signal = controller.signal
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 5 * 60 * 1000)
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendFirstBeat = () => {
        console.log('first heartbeat.')
        controller.enqueue(encoder.encode('<p>loading...</p>'))
      }
      const heartBeat = setTimeout(sendFirstBeat, 0)
      try {
        const resp = await worker.fetch(cfReq, env, { signal })
        clearTimeout(heartBeat)
        controller.enqueue(encoder.encode(await resp.text()))
        controller.close()
        clearTimeout(timeoutId)
      } catch (e) {
        if (e.name === 'AbortError') {
          console.log('请求被取消');
        } else {
          console.log('请求失败', e);
        }
        controller.close()
        clearTimeout(timeoutId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
