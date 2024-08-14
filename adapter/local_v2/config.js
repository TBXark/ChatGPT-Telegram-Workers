import fs from 'node:fs';
import toml from 'toml';

const TOML_PATH = '../../wrangler.toml';
const raw = fs.readFileSync(TOML_PATH, 'utf-8');
const config = toml.parse(raw);
fs.writeFileSync('./config.json', JSON.stringify(config, null, '  '));