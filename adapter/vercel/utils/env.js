import fs from 'node:fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env', 'utf-8')) || {};
fs.writeFileSync('deploy.sh', `#!/bin/bash
PATH=$PATH:./node_modules/.bin
${
    Object.entries(env).map(([key, value]) => `echo "${value}" | vercel env add ${key} production`).join('\n')
}
vercel deploy --prod
`);
fs.chmodSync('deploy.sh', '755');
