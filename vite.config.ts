import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import checker from 'vite-plugin-checker';
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
import nodeExternals from 'rollup-plugin-node-externals';
import { createVersionPlugin, versionDefine } from "./src/adapter/version";
import { createDockerPlugin } from "./src/adapter/docker";

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
const entry = path.resolve(__dirname, BUILD_MODE === 'local' ? 'src/adapter/local.ts' : 'src/index.ts');

if (BUILD_MODE === 'local') {
    plugins.push(createDockerPlugin('dist'));
} else {
    plugins.push(createVersionPlugin('dist'))
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
    define: {
        ...versionDefine
    },
});
