import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { parse } from 'toml';

async function main() {
    const {
        TOML_PATH = 'wrangler.toml',
    } = process.env;
    const { vars } = parse(await fs.readFile(TOML_PATH, 'utf-8'));
    for (const [key, value] of Object.entries(vars)) {
        try {
            execSync(`vercel env add ${key} production --force`, {
                input: `${value}`,
                encoding: 'utf-8',
            });
        } catch (e) {
            console.error(e);
        }
    }
}

main().catch(console.error);
