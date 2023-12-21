import { initEnv } from './src/env.js'
import { handleRequest } from './src/router.js'
import { errorToString } from './src/utils.js'
import logger from './src/logger.js'

export default {
  async fetch(request, env) {
    try {
      initEnv(env)

      const resp = await handleRequest(request)
      return resp || new Response('NOT_FOUND', { status: 404 })
    } catch (e) {
      logger('error', e)
      return new Response(errorToString(e), { status: 500 })
    }
  },
}
