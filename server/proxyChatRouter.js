import sqlite3 from 'sqlite3';
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import request from 'request'
import express from 'express'
import { body, validationResult } from 'express-validator'
import { TELEGRAM_API, ACCESS_CODE } from './constants.js'
import utils from './utils.js'
const app = express.Router()

// Initialize the SQLite database
const db = new sqlite3.Database('./data.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a table for storing key-value pairs
db.run('CREATE TABLE IF NOT EXISTS keyValueStore (key TEXT PRIMARY KEY, value TEXT)', (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.get('/', (req, res) => {
    console.log('GET /envatocheckandsave');
    console.log(req.query);
    if (!req.query.chatConfigUrl) {
        console.log('Missing required "chatConfigUrl" parameter.')
        return res.status(400).send('Missing required "chatConfigUrl" parameter.');
    }

    // Check if the 'key' parameter is provided
    if (!req.query.key) {
        return res.status(400).send('Missing required "key" parameter.');
    }

    // Extract and sanitize the parameters
    const registeredUrlEncoded = utils.sanitizeText(req.query.registeredurl);
    const key = utils.sanitizeText(req.query.key);

    // Decode the registered URL, ensuring it's a valid base64 string
    let registeredUrl;
    try {
        registeredUrl = Buffer.from(registeredUrlEncoded, 'base64').toString('utf-8');
    } catch (err) {
        return res.status(400).send('Invalid base64 encoding in "registeredurl" parameter.');
    }
    // Check if the key exists in the database
    db.get('SELECT value FROM keyValueStore WHERE key = ?', [key], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Database error');
        }
        if (row) {
            if (row.value === registeredUrl) {
                return res.send('This URL is already registered.');
            } else {
                return res.send('This key is already registered. The url is: '+row.value);
            }
        } else {
            db.run('INSERT INTO keyValueStore (key, value) VALUES (?, ?)', [key, registeredUrl], (insertErr) => {
                if (insertErr) {
                    console.error(insertErr.message);
                    return res.status(500).send('Database error');
                }
                res.send('Success');
            });
        }
    });
});

export default app
