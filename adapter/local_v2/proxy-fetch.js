import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
// Configure https proxy
const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
    console.log(`https proxy: ${proxy}`);
    const agent = new HttpsProxyAgent(proxy);
    globalThis.fetch = async (url, init) => {
        return fetch(url, { agent, ...init });
    };
}
