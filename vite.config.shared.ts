import type { Plugin, UserConfig } from 'vite';
import * as path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

export interface Options {
    root: string;
    types?: boolean;
    nodeExternals?: boolean;
    excludeMonoRepoPackages?: boolean;
}

export function createShareConfig(options: Options): UserConfig {
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
    ];
    if (options.types) {
        plugins.push(
            dts({
                rollupTypes: true,
            }),
        );
    }
    if (options.nodeExternals) {
        const exclude = new Array<RegExp>();
        if (options.excludeMonoRepoPackages) {
            exclude.push(/^@chatgpt-telegram-workers\/.+/);
        }
        plugins.push(
            nodeExternals({
                exclude,
            }),
        );
    }
    return defineConfig({
        plugins,
        build: {
            target: 'esnext',
            lib: {
                entry: path.resolve(options.root, 'src/index'),
                fileName: 'index',
                formats: ['es'],
            },
            minify: false,
            outDir: path.resolve(options.root, 'dist'),
            rollupOptions: {
                external: [],
                output: {
                    preserveModules: false,
                },
            },
        },
    });
}
