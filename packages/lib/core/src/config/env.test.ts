import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'toml';
import { ENV } from './env';

describe('env', () => {
    it('should load env', () => {
        const toml = path.join(__dirname, '../../../../../wrangler-example.toml');
        const config = parse(readFileSync(toml, 'utf8'));
        ENV.merge({
            ...config.vars,
            DATABASE: {},
        });
        expect(ENV).toBeDefined();
        expect(ENV.USER_CONFIG.AI_PROVIDER).toBe('auto');
    });
});
