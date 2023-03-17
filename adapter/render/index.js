import fs from 'fs';
import fetch, {Headers, Request, Response} from 'node-fetch';
import http from 'http';
import {TextEncoder} from 'util';
import HttpsProxyAgent from 'https-proxy-agent';
import {RedisCache} from './redis.js';

try {
  const buildInfo = JSON.parse(fs.readFileSync('../dist/buildinfo.json', 'utf-8'));
  process.env.BUILD_TIMESTAMP = buildInfo.timestamp;
  process.env.BUILD_VERSION = buildInfo.sha;
  console.log(buildInfo);
} catch (e) {
  console.log(e);
}

/**
 * 启动服务
 * @param {int} port 端口
 * @param {string} host 监听host
 * @param {Object} env 环境变量
 * @param {function} handler handler
 */
function startServer(port, host, env, handler) {
  const methods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  port = port || 3000;
  host = host || 'localhost';
  env = Object.assign({
    REDIS_URL: 'redis://localhost:6379',
  }, env);
  env.DATABASE = new RedisCache(env.REDIS_URL);
  const server = http.createServer(async (req, res) => {
    console.log(`\x1b[31m${req.method}\x1b[0m: ${req.url}`);
    const reqHost = req.headers['x-forwarded-host'] || req.headers['host'] || req.host || host;
    const reqScheme = req.headers['x-forwarded-proto'] || req.headers['x-scheme'] || 'http';
    const url = `${reqScheme}://${reqHost}` + req.url;
    const method = req.method;
    const headers = req.headers;
    const body = methods.has(method) ? req : null;
    const fetchReq = new Request(url, {method, headers, body});
    try {
      const fetchRes = await handler(fetchReq, env);
      res.statusCode = fetchRes.status;
      res.statusMessage = fetchRes.statusText;
      res.headers = fetchRes.headers;
      const body = await fetchRes.text();
      res.end(body);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.timeout = 30000;
  server.listen(port, host, () => {
    console.log(`Server listening on  http://${host}:${port}`);
  });
}


global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.TextEncoder = TextEncoder;


const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxy) {
  console.log(`https proxy: ${proxy}`);
  const agent = new HttpsProxyAgent(proxy);
  global.fetch = async (url, init) => {
    return fetch(url, {agent, ...init});
  };
}

// 延迟加载 ../main.js， 防止ENV过早初始化
const {default: worker} = await import('../main.js');
startServer(process.env.PORT, process.env.HOST, process.env, worker.fetch);
