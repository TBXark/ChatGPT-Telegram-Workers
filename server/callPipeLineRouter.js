import sqlite3 from 'sqlite3';
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import request from 'request'
import express from 'express'
import { body, validationResult } from 'express-validator'
import { TELEGRAM_API, ACCESS_CODE } from './constants.js'
import utils from './utils.js'
import dotenv from 'dotenv';



const app = express.Router()


app.post('/', async (req, res) => {

    //i need strings product and audience and chatId

    const product = req.query.product;
    const audience = req.query.audience;
    const chatId = req.query.chatId;

    console.log(req.query);
    //load parameters from .env file
    dotenv.config();

    const bearer_token = process.env.GITHUB_BEARER_TOKEN;

    //call api github workflow https://github.com/noxonsu/gptPipeLine/actions/workflows/general.yml with parameters product and audience

    //call api github workflow barier token from env

    /* workflow example
    on:
  workflow_dispatch:
    inputs:
      MY_PRODUCT:
        description: 'Your product'
        required: true
        default: 'technology' # You can change the default value
      MY_TARGET_AUDIENCE:
        description: 'Your target audience'
        required: true
        default: '50+ emploees companies' # You can change the default value
      TG_CHAT_ID:
        description: 'tg chat_id ex: 123456789'
        required: true
        default: '' # You can change the default value        
      TG_BOT_TOKEN:
        description: 'TG_BOT_TOKEN: '
        required: true
        default: '' # You can change the default value  
      MY_OPENAI_KEY:
        description: 'MY_OPENAI_KEY sk-... '
        required: false
        default: '' # You can change the default value   
    */
    const options = {
        url: 'https://api.github.com/repos/noxonsu/gptPipeLine/actions/workflows/general.yml/dispatches',
        headers: {
            'User-Agent': 'YourAppName or any identifiable string'
        },
        auth: {
            'bearer': bearer_token // Ensure this variable contains your token
        },
        json: {
            ref: 'main',
            inputs: {
                MY_PRODUCT: product,
                MY_TARGET_AUDIENCE: audience,
                TG_CHAT_ID: chatId,
                TG_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
                MY_OPENAI_KEY: process.env.OPENAI_API_KEY
            }
        }
    };

    console.log('POST /callPipeline');

    request.post(options, (error, response, body) => {
        if (error) {
            console.error('An error occurred:', error);
            return res.status(500).send('Error calling pipeline');
        }
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        res.send('Pipeline called successfully');
    });

}

);


export default app
