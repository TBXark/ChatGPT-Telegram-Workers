import fs from 'node:fs';
import toml from 'toml';

const TOME_PATH = '../../wrangler.toml';
const raw = fs.readFileSync(TOME_PATH, 'utf-8');
const config = toml.parse(raw);
fs.writeFileSync('./config.json', JSON.stringify(config, null, '  '));