import * as path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import checker from 'vite-plugin-checker';
import nodeExternals from 'rollup-plugin-node-externals';
import dts from 'vite-plugin-dts';
import { createVersionPlugin, versionDefine } from './src/adapter/version';
import { createDockerPlugin } from './src/adapter/docker';

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

const buildLocalMode = BUILD_MODE === 'local';
const entry = path.resolve(__dirname, buildLocalMode ? 'src/adapter/local.ts' : 'src/index.ts');

if (buildLocalMode) {
    plugins.push(createDockerPlugin('dist'));
} else {
    plugins.push(createVersionPlugin('dist'));
    plugins.push(dts({
        rollupTypes: true,
    }));
}

export default defineConfig({
    plugins,
    build: {
        target: 'esnext',
        lib: {
            entry,
            fileName: 'index',
            formats: buildLocalMode ? ['es'] : ['es', 'cjs'],
        },
        minify: false,
    },
    define: {
        ...versionDefine,
    },
});
