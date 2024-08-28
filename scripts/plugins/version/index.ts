import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import path from 'node:path';

let COMMIT_HASH = 'unknown';
const TIMESTAMP = Math.floor(Date.now() / 1000);

try {
    COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn(e);
}

export function createVersionPlugin(targetDir: string) {
    return {
        name: 'buildInfo',
        async closeBundle() {
            await fs.writeFile(path.resolve(targetDir, 'timestamp'), TIMESTAMP.toString());
            await fs.writeFile(path.resolve(targetDir, 'buildinfo.json'), JSON.stringify({
                sha: COMMIT_HASH,
                timestamp: TIMESTAMP,
            }));
        },
    };
}

export const versionDefine = {
    __BUILD_VERSION__: JSON.stringify(COMMIT_HASH),
    __BUILD_TIMESTAMP__: TIMESTAMP.toString(),
};
