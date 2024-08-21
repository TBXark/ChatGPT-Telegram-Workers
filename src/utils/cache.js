/**
 * A simple cache implementation.
 * 主要作用
 *  1. 防止本地部署使用base64图片时，重复请求相同的图片
 *  2. 上传图片telegraph后又使用base64图片时，重复请求相同的图片
 */
export class Cache {
    constructor() {
        this.maxItems = 10;
        this.maxAge = 1000 * 60 * 60;
        this.cache = {};
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.trim();
        this.cache[key] = {
            value,
            time: Date.now(),
        };
    }

    /**
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        this.trim();
        return this.cache[key]?.value;
    }

    /**
     * @private
     */
    trim() {
        let keys = Object.keys(this.cache);
        for (const key of keys) {
            if (Date.now() - this.cache[key].time > this.maxAge) {
                delete this.cache[key];
            }
        }
        keys = Object.keys(this.cache);
        if (keys.length > this.maxItems) {
            keys.sort((a, b) => this.cache[a].time - this.cache[b].time);
            for (let i = 0; i < keys.length - this.maxItems; i++) {
                delete this.cache[keys[i]];
            }
        }
    }
}
