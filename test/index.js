import adapter, { bindGlobal } from 'cloudflare-worker-adapter'
import worker from '../main.js'
import { LocalCache } from 'cloudflare-worker-adapter/cache/local.js'
import fs from 'fs'
import HttpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'

const agent = new HttpsProxyAgent('http://127.0.0.1:8888')
const proxyFetch = async (url, init) => {
    return fetch(url, {agent, ...init})
}
bindGlobal({ 
    fetch: proxyFetch
})

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
const cache = new LocalCache(config.database)

adapter.startServer(config.port, config.host, '../wrangler.toml', {DATABASE: cache}, {server: config.server}, worker.fetch)
