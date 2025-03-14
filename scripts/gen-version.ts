import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import path from 'node:path';

const TIMESTAMP = Math.floor(Date.now() / 1000);
const COMMIT_HASH = ((): string => {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        console.warn(e);
    }
    return 'unknown';
})();

async function createVersionTs(outDir: string) {
    await fs.writeFile(
        path.resolve(outDir, 'packages/lib/core/src/config/version.ts'),
        `export const BUILD_TIMESTAMP = ${TIMESTAMP};\nexport const BUILD_VERSION = '${COMMIT_HASH}';\n`,
    );
}

async function createVersionJson(outDir: string) {
    await fs.writeFile(path.resolve(outDir, 'dist/buildinfo.json'), JSON.stringify({
        sha: COMMIT_HASH,
        timestamp: TIMESTAMP,
    }));
}

export async function createVersion(outDir: string) {
    await createVersionTs(outDir);
    await createVersionJson(outDir);
}

const {
    TARGET_DIR = '.',
} = process.env;

createVersion(TARGET_DIR).catch(console.error);
