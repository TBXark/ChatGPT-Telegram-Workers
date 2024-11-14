import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { parse } from 'toml';

async function main() {
    const {
        TOML_PATH = 'wrangler.toml',
        VERCEL_ENV = 'production',
        VERCEL_BIN = './node_modules/.bin/vercel',
    } = process.env;

    const envs = execSync(`${VERCEL_BIN} env ls ${VERCEL_ENV}`, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .map(l => l.trim())
        .slice(1)
        .map(l => l.split(/\s+/)[0])
        .map(l => l.replace(/[^\x20-\x7E]/g, '').replace(/\[\d+m/g, ''));
    const usedKeys = new Set<string>();
    usedKeys.add('UPSTASH_REDIS_REST_URL');
    usedKeys.add('UPSTASH_REDIS_REST_TOKEN');
    const { vars } = parse(await fs.readFile(TOML_PATH, 'utf-8'));
    for (const [key, value] of Object.entries(vars)) {
        try {
            usedKeys.add(key);
            execSync(`${VERCEL_BIN} env add ${key} ${VERCEL_ENV} --force`, {
                input: `${value}`,
                encoding: 'utf-8',
            });
        } catch (e) {
            console.error(e);
        }
    }
    for (const key of envs) {
        if (!usedKeys.has(key)) {
            console.log(`Delete ${key}?)`);
            execSync(`${VERCEL_BIN} env rm ${key} ${VERCEL_ENV}`, {
                encoding: 'utf-8',
            });
        }
    }
}

main().catch(console.error);
