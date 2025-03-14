/**
 * A simple cache implementation.
 * 主要作用
 *  1. 防止本地部署使用base64图片时，重复请求相同的图片
 *  2. 上传图片telegraph后又使用base64图片时，重复请求相同的图片
 */
export class Cache<T> {
    private readonly maxItems: number;
    private readonly maxAge: number;
    private readonly cache: Record<string, { value: T; time: number }>;

    constructor() {
        this.maxItems = 10;
        this.maxAge = 1000 * 60 * 60;
        this.cache = {};
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);
    }

    set(key: string, value: T) {
        this.trim();
        this.cache[key] = {
            value,
            time: Date.now(),
        };
    }

    get(key: string): T | undefined | null {
        this.trim();
        return this.cache[key]?.value;
    }

    private trim() {
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
