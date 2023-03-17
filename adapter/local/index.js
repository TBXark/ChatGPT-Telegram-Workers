import adapter, { bindGlobal } from 'cloudflare-worker-adapter'
import { SqliteCache } from 'cloudflare-worker-adapter/cache/sqlite.js'
import fs from 'fs'
import HttpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'


const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
const cache = new SqliteCache(config.database)

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

try {
    const buildInfo = JSON.parse(fs.readFileSync('../dist/buildinfo.json', 'utf-8'))
    process.env.BUILD_TIMESTAMP = buildInfo.timestamp
    process.env.BUILD_VERSION = buildInfo.sha
    console.log(buildInfo)
} catch (e) {
    console.log(e)
}

// 延迟加载 ../main.js， 防止ENV过早初始化
const { default: worker } = await import('../../main.js')
adapter.startServer(config.port, config.host, config.toml, {DATABASE: cache}, {server: config.server}, worker.fetch)
