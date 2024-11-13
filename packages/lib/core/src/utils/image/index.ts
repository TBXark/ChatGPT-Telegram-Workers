import { Cache } from '../cache';

const IMAGE_CACHE = new Cache<Blob>();

async function fetchImage(url: string): Promise<Blob> {
    const cache = IMAGE_CACHE.get(url);
    if (cache) {
        return cache;
    }
    return fetch(url)
        .then(resp => resp.blob())
        .then((blob) => {
            IMAGE_CACHE.set(url, blob);
            return blob;
        });
}

async function urlToBase64String(url: string): Promise<string> {
    if (typeof Buffer !== 'undefined') {
        return fetchImage(url)
            .then(blob => blob.arrayBuffer())
            .then(buffer => Buffer.from(buffer).toString('base64'));
    } else {
    // 非原生base64编码速度太慢不适合在workers中使用
    // 在wrangler.toml中添加 Node.js 选项启用nodejs兼容
    // compatibility_flags = [ "nodejs_compat" ]
        return fetchImage(url)
            .then(blob => blob.arrayBuffer())
            .then(buffer => btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as unknown as number[])));
    }
}

function getImageFormatFromBase64(base64String: string): string {
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

interface Base64DataWithFormat {
    data: string;
    format: string;
}

export async function imageToBase64String(url: string): Promise<Base64DataWithFormat> {
    const base64String = await urlToBase64String(url);
    const format = getImageFormatFromBase64(base64String);
    return {
        data: base64String,
        format: `image/${format}`,
    };
}

export function renderBase64DataURI(params: Base64DataWithFormat): string {
    return `data:${params.format};base64,${params.data}`;
}
