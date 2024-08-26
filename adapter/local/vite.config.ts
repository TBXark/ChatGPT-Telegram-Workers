import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { nodeExternals } from 'rollup-plugin-node-externals';


const COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
const TIMESTAMP = Math.floor(Date.now() / 1000);

export default defineConfig({
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        nodeExternals({
            exclude: ['cloudflare-worker-adapter', 'cloudflare-worker-adapter/fetchProxy']
        }),
    ],
    build: {
        target: 'esnext',
        lib: {
            entry: 'index.ts',
            fileName: 'index',
            formats: ['cjs'],
        },
    },
    define: {
        __BUILD_VERSION__: JSON.stringify(COMMIT_HASH),
        __BUILD_TIMESTAMP__: TIMESTAMP.toString(),
    },
});
