import esbuild from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs/promises';


/**
 *
 */
async function build() {
    
    let COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
    let TIMESTAMP = Math.floor(Date.now() / 1000);

    try {
        const raw = await fs.readFile('../../dist/buildinfo.json');
        const buildInfo = JSON.parse(raw.toString());
        COMMIT_HASH = buildInfo.sha;
        TIMESTAMP = buildInfo.timestamp;
    } catch (e) {
        console.error(e);
    }

    await esbuild.build({
        entryPoints: ['index.js'],
        bundle: true,
        minify: false,
        outfile: './build/index.js',
        platform: 'node',
        format: 'esm',
        banner: {
            js: '#!/usr/bin/env node\n/* eslint-disable */',
        },
        define: {
            'process.env.BUILD_VERSION': `'${COMMIT_HASH}'`,
            'process.env.BUILD_TIMESTAMP': TIMESTAMP.toString(),
        },
    });
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});