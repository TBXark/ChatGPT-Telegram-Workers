import * as process from 'node:process';
import { createVercelPlugin } from './index';

const {
    VERCEL_PATH = 'vercel',
    TOML_PATH = 'wrangler.toml',
} = process.env;

const plugin = createVercelPlugin(VERCEL_PATH, TOML_PATH);
plugin.closeBundle().catch(console.error);
