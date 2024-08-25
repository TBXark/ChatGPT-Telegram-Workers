import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import checker from 'vite-plugin-checker';

const TIMESTAMP_FILE = './dist/timestamp';
const BUILD_INFO_JSON = './dist/buildinfo.json';

const COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
const TIMESTAMP = Math.floor(Date.now() / 1000);

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        cleanup({
            comments: 'none',
            extensions: ['js', 'ts'],
        }),
        checker({
            typescript: true,
        }),
        {
            name: 'buildInfo',
            async closeBundle() {
                await fs.writeFile(TIMESTAMP_FILE, TIMESTAMP.toString());
                await fs.writeFile(BUILD_INFO_JSON, JSON.stringify({
                    sha: COMMIT_HASH,
                    timestamp: TIMESTAMP,
                }));
            },
        },
    ],
    build: {
        target: 'esnext',
        lib: {
            entry: 'src/index.ts',
            fileName: 'index',
            formats: ['es'],
        },
        minify: false,
        rollupOptions: {
            external: ['node:buffer'],
            plugins: [
            ],
        },
    },
    define: {
        __BUILD_VERSION__: JSON.stringify(COMMIT_HASH),
        __BUILD_TIMESTAMP__: TIMESTAMP.toString(),
    },
});
