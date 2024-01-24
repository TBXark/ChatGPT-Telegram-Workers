import sqlite3 from 'sqlite3';
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import request from 'request'
import express from 'express'
import { body, validationResult } from 'express-validator'
import { TELEGRAM_API, ACCESS_CODE } from './constants.js'
import utils from './utils.js'
import bodyParser from 'body-parser';


const app = express.Router()
app.use(bodyParser.json())
// Initialize the SQLite database
const db = new sqlite3.Database('./data.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a table for storing key-value pairs
db.run('CREATE TABLE IF NOT EXISTS envatoLicenseKeys (id INTEGER PRIMARY KEY AUTOINCREMENT, envatoLicense TEXT UNIQUE, url TEXT)', (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.post('/', (req, res) => {
    console.log('GET /envatocheckandsave');
    console.log(req.body);

    if (!req.body.registeredurl) {
        console.log('Missing required "registeredurl" parameter.')
        return res.status(400).json({ error: 'Missing required "registeredurl" parameter.' });
    }
    //load rsa_private_key from post body
    if (!req.body.rsa_private_key) {
        console.log('Missing required "rsa_private_key" parameter.')
        return res.status(400).json({ error: 'Missing required "rsa_private_key" parameter.' });
    } else {
        const privateKey = req.body.rsa_private_key;
        const privateKeyPath = './private.pem';

        if (!fs.existsSync(privateKeyPath)) {
            fs.writeFileSync(privateKeyPath, privateKey);
            //generate public key
            const publicKeyPath = './public.pem';
            exec(`openssl rsa -in ${privateKeyPath} -pubout -outform PEM -out ${publicKeyPath}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error in exec:', err);
                    return res.status(500).json({ error: 'Error generating public key' });
                }
                console.log('Exec stdout:', stdout);
                console.error('Exec stderr:', stderr);

                // Continue with the rest of your code here, ensuring that the file operations have completed
            });
        }


    }
    if (!req.body.key) {
        return res.status(400).json({ error: 'Missing required "key" parameter.' });
    }

    const registeredUrlEncoded = utils.sanitizeText(req.body.registeredurl);
    const envatoLicense = utils.sanitizeText(req.body.key);

    let registeredUrl;
    try {
        registeredUrl = Buffer.from(registeredUrlEncoded, 'base64').toString('utf-8');
    } catch (err) {
        return res.status(400).json({ error: 'Invalid base64 encoding in "registeredurl" parameter.' });
    }

    db.get('SELECT * FROM envatoLicenseKeys WHERE envatoLicense = ?', [envatoLicense], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if license exists with the same URL
        if (row && row.url === registeredUrl) {
            return res.json({ 
                message: 'This license is already registered with your WebSite.',
                id: row.id,
                publicKeyBase64: fs.readFileSync('public.pem').toString('base64') 
            });
        }
        // Check if license exists with a different URL
        else if (row) {
            return res.status(400).json({ error: `envatoLicense already exists with a different URL: ${row.url}` });
        } else {
            // Insert the new license
            db.run('INSERT INTO envatoLicenseKeys (envatoLicense, url) VALUES (?, ?)', [envatoLicense, registeredUrl], function(insertErr) {
                if (insertErr) {
                    console.error(insertErr.message);
                    return res.status(500).json({ error: 'Database error during insert' });
                }
                res.json({ 
                    message: 'License added successfully', 
                    id: this.lastID,  // Get the ID of the newly inserted record
                    publicKey: fs.readFileSync('public.pem').toString()
                });
            });
        }
    });
});

export default app
