import adapter, { bindGlobal } from 'cloudflare-worker-adapter'
import worker from '../main.js'
import { LocalCache } from 'cloudflare-worker-adapter/cache/local.js'
import fs from 'fs'
import HttpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'


const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
const cache = new LocalCache(config.database)

const proxy = config.https_proxy || process.env.https_proxy || process.env.HTTPS_PROXY
if (proxy) {
    console.log(`https proxy: ${proxy}`)
    const agent = new HttpsProxyAgent(proxy)
    const proxyFetch = async (url, init) => {
        return fetch(url, {agent, ...init})
    }
    bindGlobal({ 
        fetch: proxyFetch
    })
}

adapter.startServer(config.port, config.host, '../wrangler.toml', {DATABASE: cache}, {server: config.server}, worker.fetch)
