import fs from 'node:fs';
import toml from 'toml';
import dotenv from 'dotenv';

function tryWithDefault(fn, defaultValue) {
    try {
        return fn();
    } catch {
        return defaultValue;
    }
}

const env = tryWithDefault(() => dotenv.parse(fs.readFileSync('.env', 'utf-8')), {});
const wranglerConfig = toml.parse(fs.readFileSync('../../wrangler.toml', 'utf-8')).vars;
const buildInfo = JSON.parse(fs.readFileSync('../../dist/buildinfo.json', 'utf-8'));

const newEnv = {
    ...env,
    ...wranglerConfig,
    BUILD_TIMESTAMP: buildInfo.timestamp,
    BUILD_VERSION: buildInfo.sha,
};

console.log(newEnv);
fs.writeFileSync('.env', Object.entries(newEnv).map(([key, value]) => `${key}="${`${value}`.replace(/"/g, '\\"')}"`).join('\n'));
