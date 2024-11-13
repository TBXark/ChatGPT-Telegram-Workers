import { readFileSync } from 'node:fs';
import { parse } from 'toml';
import { ENV } from './env';

{
    const toml = readFileSync('./wrangler.toml', 'utf8');
    const config = parse(toml);
    ENV.merge({
        ...config.vars,
        DATABASE: {},
    });
    console.log(JSON.stringify(ENV, null, 2));
}
