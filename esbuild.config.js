import esbuild from 'esbuild';
import fs from 'fs/promises';
import { execSync } from 'child_process';

const TIMESTAMP_FILE = './dist/timestamp';
const BUILD_INFO_JSON = './dist/buildinfo.json';
const OUTPUT_FILE = './dist/index.js';
const ENTRY_FILE = 'main.js';

async function clean() {
  for (const file of [TIMESTAMP_FILE, BUILD_INFO_JSON, OUTPUT_FILE]) {
    try {
      await fs.unlink(file);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

async function build() {
  await clean();

  const COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
  const TIMESTAMP = Math.floor(Date.now() / 1000);

  await fs.writeFile(TIMESTAMP_FILE, TIMESTAMP.toString());
  await fs.writeFile(BUILD_INFO_JSON, JSON.stringify({
    sha: COMMIT_HASH,
    timestamp: TIMESTAMP
  }));

  try {
    await esbuild.build({
      entryPoints: [ENTRY_FILE],
      bundle: true,
      outfile: OUTPUT_FILE,
      format: 'esm',
      platform: 'node',
      define: {
        'process.env.BUILD_VERSION': `'${COMMIT_HASH}'`,
        'process.env.BUILD_TIMESTAMP': TIMESTAMP.toString()
      }
    });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();