import esbuild from 'esbuild';

esbuild.build({
    entryPoints: ['index.js'],
    bundle: true,
    minify: false,
    outfile: './build/index.js',
    platform: 'node',
    format: 'esm',
    banner: {
        js: '#!/usr/bin/env node\n/* eslint-disable */',
    },
}).catch(() => process.exit(1));