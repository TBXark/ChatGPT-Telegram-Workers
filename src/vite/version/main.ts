import process from 'node:process';
import { createVersion } from './index';

const {
    OUT_DIR = '.',
} = process.env;

createVersion(OUT_DIR).catch(console.error);
