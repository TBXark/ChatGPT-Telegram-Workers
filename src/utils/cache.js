export class Cache {
    constructor() {
        this.maxItems = 10;
        this.maxAge = 1000 * 60 * 60;
        this.cache = {};
    }

    set(key, value) {
        this.trim();
        this.cache[key] = {
            value,
            time: Date.now(),
        };
    }

    get(key) {
        this.trim();
        return this.cache[key].value;
    }

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
