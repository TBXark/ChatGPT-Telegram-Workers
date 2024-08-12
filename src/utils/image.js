import {Cache} from './cache.js';

const IMAGE_CACHE = new Cache();

/**
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
async function fetchImage(url) {
    if (IMAGE_CACHE[url]) {
        return IMAGE_CACHE.get(url);
    }
    return fetch(url)
        .then(resp => resp.arrayBuffer())
        .then(blob => {
            IMAGE_CACHE.set(url, blob);
            return blob;
        });
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function uploadImageToTelegraph(url) {
    if (url.startsWith('https://telegra.ph')) {
        return url;
    }
    const raw = await fetch(url).then(resp => resp.arrayBuffer());
    const formData = new FormData();
    formData.append('file', new Blob([raw]), 'blob');

    const resp = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: formData,
    });
    let [{src}] = await resp.json();
    src = `https://telegra.ph${src}`;
    IMAGE_CACHE.set(url, raw);
    return src;
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function urlToBase64String(url) {
    try {
        const {Buffer} = await import('node:buffer');
        return fetchImage(url)
            .then(buffer => Buffer.from(buffer).toString('base64'));
    } catch {
    // 非原生base64编码速度太慢不适合在workers中使用
    // 在wrangler.toml中添加 Node.js 选项启用nodejs兼容
    // compatibility_flags = [ "nodejs_compat" ]
        return fetchImage(url)
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
 * @typedef {object} DataBase64
 * @property {string} data
 * @property {string} format
 * @param {string} url
 * @returns {Promise<DataBase64>}
 */
export async function imageToBase64String(url) {
    const base64String = await urlToBase64String(url);
    const format = getImageFormatFromBase64(base64String);
    return {
        data: base64String,
        format: `image/${format}`,
    };
}

/**
 * @param {DataBase64} params
 * @returns {string}
 */
export function renderBase64DataURI(params) {
    return `data:${params.format};base64,${params.data}`;
}
