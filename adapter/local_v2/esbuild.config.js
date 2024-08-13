import { build } from '../script/esbuild.config.js';

build('../../dist/buildinfo.json', 'build/index.js').catch(() => process.exit(1));