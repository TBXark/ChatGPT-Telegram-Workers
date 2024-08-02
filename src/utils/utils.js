/**
 * @param {number} length
 * @return {string}
 */
export function randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

/**
 * @param {string} body
 * @return {string}
 */
export function renderHTML(body) {
    return `
<html>  
  <head>
    <title>ChatGPT-Telegram-Workers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="ChatGPT-Telegram-Workers">
    <meta name="author" content="TBXark">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
      }
      a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      strong {
        font-weight: bolder;
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>
  `;
}

/**
 * @param {Error} e
 * @return {string}
 */
export function errorToString(e) {
    return JSON.stringify({
        message: e.message,
        stack: e.stack,
    });
}


/**
 *
 * @param {Response} resp
 * @return {Response}
 */
export async function makeResponse200(resp) {
    if (resp === null) {
        return new Response('NOT HANDLED', {status: 200});
    }
    if (resp.status === 200) {
        return resp;
    } else {
        // 如果返回4xx，5xx，Telegram会重试这个消息，后续消息就不会到达，所有webhook的错误都返回200
        return new Response(resp.body, {
            status: 200,
            headers: {
                'Original-Status': resp.status,
                ...resp.headers,
            }
        });
    }
}

/**
 * @returns {boolean}
 */
export function supportsNativeBase64() {
    return typeof Buffer !== 'undefined';
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function urlToBase64String(url) {
   try {
       const { Buffer } = await import('node:buffer');
       return fetch(url)
           .then(resp  => resp.arrayBuffer())
           .then(buffer => Buffer.from(buffer).toString('base64'));
   } catch {
       // 非原生base64编码速度太慢不适合在workers中使用
       // 在wrangler.toml中添加 Node.js 选项启用nodejs兼容
       // compatibility_flags = [ "nodejs_compat" ]
       return fetch(url)
         .then(resp  => resp.arrayBuffer())
         .then(buffer => btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))));
   }
}

/**
 * @param {string} base64String
 * @returns {string}
 */
function getImageFormatFromBase64(base64String) {
    const firstChar = base64String.charAt(0);
    switch (firstChar) {
        case '/':
            return 'jpeg';
        case 'i':
            return 'png';
        case 'R':
            return 'gif';
        case 'U':
            return 'webp';
        default:
            throw new Error('Unsupported image format');
    }
}

/**
 * @typedef {object} ImageBase64
 * @property {string} data
 * @property {string} format
 *
 * @param url
 * @returns {Promise<ImageBase64>}
 */
export async function imageToBase64String(url) {
    const base64String = await urlToBase64String(url);
    const format = getImageFormatFromBase64(base64String);
    return {
        data: base64String,
        format: `image/${format}`
    };
}

/**
 * @param {ImageBase64} params
 * @returns {string}
 */
export function renderImageBase64DataURI(params) {
    return `data:image/${params.format};base64,${params.data}`;
}