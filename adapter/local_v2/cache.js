import fs from 'node:fs';

export class MemoryCache {
    constructor() {
        this.cache = {};
    }

    async get(key) {
        return this.cache[key];
    }

    async put(key, value) {
        this.cache[key] = value;
    }

    async delete(key) {
        delete this.cache[key];
    }

    syncToDisk(path) {
        fs.writeFileSync(path, JSON.stringify(this.cache));
    }
}
