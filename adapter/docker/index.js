/* eslint-disable require-jsdoc */
import adapter from 'cloudflare-worker-adapter';
import {SqliteCache} from 'cloudflare-worker-adapter/cache/sqlite.js';
import worker from 'cloudflare-worker-adapter';

const cache = new SqliteCache('./config/cache.sqlite');

adapter.startServer(
    8787,
    'localhost',
    './config/config.toml',
    {DATABASE: cache},
    {server: process.env.DOMAIN},
    worker.fetch,
);
