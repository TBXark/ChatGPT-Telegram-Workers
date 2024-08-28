import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { parse } from 'toml';

export function createVercelPlugin(vercelPath: string, tomlPath: string) {
    return {
        name: 'vercel',
        async closeBundle() {
            const { vars } = parse(await fs.readFile(tomlPath, 'utf-8'));
            for (const [key, value] of Object.entries(vars)) {
                execSync(`${vercelPath} env add ${key} production --force`, {
                    input: `${value}`,
                    encoding: 'utf-8',
                });
            }
        },
    };
}
