import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { parse } from 'toml';
import { ENV } from '../../config/env';

export function createVercelPlugin(vercelPath: string, tomlPath: string, removeUnused = true) {
    return {
        name: 'vercel',
        async closeBundle() {
            const { vars } = parse(await fs.readFile(tomlPath, 'utf-8'));
            const keys = new Set(Object.keys(ENV).concat(Object.keys(ENV.USER_CONFIG)));
            for (const [key, value] of Object.entries(vars)) {
                keys.delete(key);
                try {
                    execSync(`${vercelPath} env add ${key} production --force`, {
                        input: `${value}`,
                        encoding: 'utf-8',
                    });
                } catch (e) {
                    console.error(e);
                }
            }
            if (removeUnused) {
                for (const key of keys) {
                    try {
                        execSync(`${vercelPath} env rm ${key} production --force`);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        },
    };
}
