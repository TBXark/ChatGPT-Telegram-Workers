import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'vite-plugin-dts';
import { terser } from 'rollup-plugin-terser';

const TIMESTAMP_FILE = './dist/timestamp';
const BUILD_INFO_JSON = './dist/buildinfo.json';

const COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
const TIMESTAMP = Math.floor(Date.now() / 1000);

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        dts({
            rollupTypes: true,
        }),
        {
            name: 'buildinfo',
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
        lib: {
            entry: './main.js',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        minify: false,
        rollupOptions: {
        external: ['node:buffer'],
          plugins: [terser({
            format: {
              comments: false,
            },
            mangle: false,
            compress: false, 
          })]
        }
    },
    define: {
        __BUILD_VERSION__: JSON.stringify(COMMIT_HASH),
        __BUILD_TIMESTAMP__: TIMESTAMP.toString(),
    },
});
