import fs from 'node:fs';
import { executeRequest } from './template.js';

const plugin = './plugins/dns.json';
const template = JSON.parse(fs.readFileSync(plugin, 'utf8'));
executeRequest(template, { DATA: ['B', 'google.com'] }).then(console.log).catch(console.error);
executeRequest(template, { DATA: ['A', 'google.com'] }).then(console.log).catch(console.error);
