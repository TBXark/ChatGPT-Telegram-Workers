import * as path from 'node:path';
import type { LibraryFormats, Plugin } from 'vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import checker from 'vite-plugin-checker';
import nodeExternals from 'rollup-plugin-node-externals';
import dts from 'vite-plugin-dts';
import { createVersionPlugin, versionDefine } from './scripts/plugins/version';
import { createDockerPlugin } from './scripts/plugins/docker';

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
        entry = 'src/index.ts';
        formats = ['es', 'cjs'];
        plugins.push(dts({
            rollupTypes: true,
        }));
        break;
    default:
        entry = 'src/index.ts';
        plugins.push(createVersionPlugin('dist'));
        break;
}

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
    define: {
        ...versionDefine,
    },
});
