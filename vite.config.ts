import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
// @ts-ignore
import nodeExternals from 'rollup-plugin-node-externals'


const { BUILD_MODE } = process.env;

const plugins: Plugin[] = [
    nodeResolve({
        preferBuiltins: true,
    }),
    cleanup({
        comments: 'none',
        extensions: ['js', 'ts'],
    }),
    dts({
        rollupTypes: true,
    }),
    checker({
        typescript: true,
    }),
    nodeExternals(),
];
const define: Record<string, string> = {};
const entry = path.resolve(__dirname, BUILD_MODE === 'local' ? 'src/entry/local.ts' : 'src/index.ts');

if (BUILD_MODE !== 'local') {
    const TIMESTAMP_FILE = './dist/timestamp';
    const BUILD_INFO_JSON = './dist/buildinfo.json';
    const COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
    const TIMESTAMP = Math.floor(Date.now() / 1000);
    plugins.push({
        name: 'buildInfo',
        async closeBundle() {
            await fs.writeFile(TIMESTAMP_FILE, TIMESTAMP.toString());
            await fs.writeFile(BUILD_INFO_JSON, JSON.stringify({
                sha: COMMIT_HASH,
                timestamp: TIMESTAMP,
            }));
        },
    });
    define.__BUILD_VERSION__ = JSON.stringify(COMMIT_HASH);
    define.__BUILD_TIMESTAMP__ = TIMESTAMP.toString();
} else {
    define.__BUILD_VERSION__ = JSON.stringify('local');
    define.__BUILD_TIMESTAMP__ = '0';
}

export default defineConfig({
    plugins,
    build: {
        target: 'esnext',
        lib: {
            entry,
            fileName: 'index',
            formats: ['es'],
        },
        minify: false,
    },
    define,
});
