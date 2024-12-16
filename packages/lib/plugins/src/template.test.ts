import * as fs from 'node:fs';
import * as path from 'node:path';
import { executeRequest } from './template';

describe('template', () => {
    it.skip('dns', async () => {
        const plugin = path.join(__dirname, '../../../../plugins/dns.json');
        const template = JSON.parse(fs.readFileSync(plugin, 'utf8'));
        const result = await executeRequest(template, { DATA: ['B', 'google.com'] });
        expect(result.content).toContain('google.com');
    });
    it('dicten', async () => {
        const plugin = path.join(__dirname, '../../../../plugins/dicten.json');
        const template = JSON.parse(fs.readFileSync(plugin, 'utf8'));
        const result = await executeRequest(template, { DATA: 'example' });
        expect(result.content).toContain('example');
    });
});
