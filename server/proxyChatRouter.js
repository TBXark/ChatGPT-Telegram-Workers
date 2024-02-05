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

app.get('/', async (req, res) => {

    //simple rate limit

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);


    console.log('GET /proxyChat');
    console.log(req.query);
    const sensoricaClientId = parseInt(req.query.sensorica_client_id);
    const postId = parseInt(req.query.post_id);

    if (!sensoricaClientId || isNaN(sensoricaClientId) || sensoricaClientId < 1) {
        console.log('Missing required "sensorica_client_id" parameter.');
        return res.status(400).json({ error: 'Missing required "sensorica_client_id" parameter.' });
    }

    if (!postId || isNaN(postId) || postId < 1) {
        console.log('Missing required "post_id" parameter.');
        return res.status(400).json({ error: 'Missing required "post_id" parameter.' });
    }

    // Assuming sensorica_client_id corresponds to the envatoLicense in the envatoLicenseKeys table
    db.get('SELECT url FROM envatoLicenseKeys WHERE id = ?', [sensoricaClientId], async (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {

            //check if the url is valid and not contain api (prevent infinite loop) 
            if (row.url.indexOf('api') > -1 || row.url.indexOf('localhost') > -1 || row.url.indexOf('proxyChat') > -1) {
                return res.status(400).json({ error: 'Invalid URL' });
            }
            //check if the url is valid
            if (row.url.indexOf('http') == -1) {
                return res.status(400).json({ error: 'Invalid URL http' });
            }
            try {
                row.url = row.url.replace('{id}', postId);
                let response = await fetch(row.url); // Now you can use await here
                let data = await response.json(); // Assuming the response is in JSON format


                //check if the data is valid
                if (!data.data) {
                    return res.status(400).json({ error: 'Invalid data' });
                }
                console.log(row.url, "MAIN_TITLE", data.data.MAIN_TITLE);

                const privateKeyPath = './private.pem';
                if (!fs.existsSync(privateKeyPath)) {
                    return res.status(400).json({ error: 'Private key not found' });
                }
                
                //decrypt the data using openssl   
                exec(`echo ${data.data.encrypted} | openssl rsautl -decrypt -inkey ${privateKeyPath}`, (err, stdout, stderr) => {
                    if (err) {
                        console.error('Error in exec:', err);
                        return res.status(500).json({ error: 'Error decrypting data' });
                    }
                    console.log('Exec stdout:', stdout);
                    console.error('Exec stderr:', stderr);
                    const decryptedData = stdout;
                    //send the decrypted data
                    //add decrypted data to the response
                    data.data.decrypted = decryptedData;
                    res.json(data);
                });

                
            } catch (error) {
                console.error('Fetch error:', error);
                res.status(500).json({ error: 'Error fetching URL' });
            }
        } else {
            res.status(404).json({ error: 'URL not found' });
        }
    });

});

export default app
