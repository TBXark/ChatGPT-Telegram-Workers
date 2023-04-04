/* eslint-disable require-jsdoc */
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env', 'utf-8')) || {};
fs.writeFileSync('deploy.sh', `#!/bin/bash\nPATH=$PATH:./node_modules/.bin\nvercel deploy --prod ${Object.entries(env).map(([key, value]) => `-e ${key}="${value}"`).join(' ')}`);
fs.chmodSync('deploy.sh', '755');
