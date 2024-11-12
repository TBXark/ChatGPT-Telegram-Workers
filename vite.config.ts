import type { LibraryFormats, Plugin } from 'vite';
import * as path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import nodeExternals from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { createDockerPlugin } from './scripts/plugins/docker';
import { createVersionPlugin } from './scripts/plugins/version';

const { BUILD_MODE } = process.env;
const plugins: Plugin[] = [
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
];

let entry: string;
let outDir = 'dist';
let fileName = 'index';
let formats: LibraryFormats[] = ['es'];
switch (BUILD_MODE) {
    case 'plugins-page':
        entry = 'src/plugins/interpolate.ts';
        fileName = 'interpolate';
        outDir = 'plugins/dist';
        break;
    case 'local':
        entry = 'src/adapter/local/index.ts';
        plugins.push(createDockerPlugin('dist'));
        break;
    case 'vercel':
        entry = 'src/adapter/vercel/index.ts';
        break;
    case 'pack':
        entry = 'src/adapter/core/index.ts';
        formats = ['es', 'cjs'];
        plugins.push(dts({
            rollupTypes: true,
        }));
        break;
    default:
        entry = 'src/adapter/core/index.ts';
        break;
}

plugins.push(createVersionPlugin(path.resolve(__dirname)));
export default defineConfig({
    plugins,
    build: {
        target: 'esnext',
        lib: {
            entry: path.resolve(__dirname, entry),
            fileName,
            formats,
        },
        minify: false,
        outDir,
    },
});
