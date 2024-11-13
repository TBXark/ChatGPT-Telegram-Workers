import * as path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import nodeExternals from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

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
        nodeExternals(),
    ],
    build: {
        target: 'esnext',
        lib: {
            entry: path.resolve(__dirname, '../src/plugins/interpolate.ts'),
            fileName: 'interpolate',
            formats: ['es'],
        },
        minify: false,
        outDir: path.resolve(__dirname, 'dist'),
    },
});
