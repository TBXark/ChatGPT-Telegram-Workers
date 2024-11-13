import type { LibraryFormats, Plugin } from 'vite';
import * as path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { createVersionPlugin } from './src/vite/version';

const {
    TYPES = 'false',
    FORMATS = 'es',
    ENTRY = 'src/entry/core/index.ts',
} = process.env;

const plugins: Plugin[] = [
    nodeResolve({
        browser: false,
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
    createVersionPlugin(path.resolve(__dirname)),
];

if (TYPES === 'true') {
    plugins.push(
        dts(),
    );
}

export default defineConfig({
    plugins,
    build: {
        target: 'esnext',
        lib: {
            entry: path.resolve(__dirname, ENTRY),
            fileName: 'index',
            formats: FORMATS.split(',') as LibraryFormats[],
        },
        minify: false,
        outDir: path.resolve(__dirname, 'dist'),
    },
});
