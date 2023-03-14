import sqlite3 from "sqlite3";

export class SqliteCache {
    constructor(path) {
        this.db = new sqlite3.Database(path);
        this.db.run("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT, expiration INTEGER)");
    }

    async get(key, info) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT value FROM cache WHERE key = ?", key, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row && row.expiration && row.expiration > 0  && row.expiration < Date.now()) {
                        this.delete(key);
                        resolve(null);
                    } else {
                        resolve(row?.value);
                    }
                }
            });
        });
    }

    async put(key, value, info) {
        let expiration = -1
        if (info && info.expiration) {
            expiration = Math.round(info.expiration);
        } else if (info && info.expirationTtl) {
            expiration = Math.round(Date.now() + info.expirationTtl * 1000);
        }
        return new Promise((resolve, reject) => {
            this.db.run("INSERT OR REPLACE INTO cache (key, value, expiration) VALUES (?, ?, ?)", key, value, expiration, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }

    async delete(key) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM cache WHERE key = ?", key, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }
}