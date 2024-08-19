import { build } from '../script/esbuild.config.js';

build('../../dist/buildinfo.json', 'build/index.js')
    .then(() => console.log('Build success'))
    .catch(() => process.exit(1));
