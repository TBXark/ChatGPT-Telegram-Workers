import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import request from 'request'
import express from 'express'
import { body, validationResult } from 'express-validator'
import { TELEGRAM_API, ACCESS_CODE } from './constants.js'
import utils from './utils.js'
const app = express.Router()


app.get('/deployChate', (req, res) => {
    // Extract inputs from query parameters
    const port = req.query.port;
    const apiKey = req.query.apiKey;
    const systemPrompt = req.query.systemPrompt;
    const mainTitle = req.query.mainTitle;
  
    // Validate and sanitize the inputs
    const sanitizedPort = parseInt(port, 10);
    if (isNaN(sanitizedPort) || sanitizedPort < 10024 || sanitizedPort > 65535) {
      return res.status(400).send('Invalid port number');
    }
  
    const sanitizedApiKey = utils.sanitizeText(apiKey);
    const sanitizedSystemPrompt = utils.sanitizeText(systemPrompt);
    const sanitizedMainTitle = utils.sanitizeText(mainTitle);
  
    // Create the setup_chatbot.sh script with sanitized inputs
    const scriptContent = `
  #!/bin/bash
  PORT=${sanitizedPort}
  git clone https://github.com/noxonsu/chate/ "../chate_${sanitizedPort}"
  
  # Navigate to the project directory
  cd "../chate_${sanitizedPort}"
  
  # Install dependencies
  npm install
  
  # Run the build command
  npm run build
  
  # Create the ecosystem file with the required content
  cat > ecosystem.config.js <<EOF
  module.exports = {
    apps: [{
      name: "chat_${sanitizedPort}",
      script: "npm",
      args: "run startcustomport",
      env: {
        npm_config_port: "${sanitizedPort}",
        OPENAI_API_KEY: "${sanitizedApiKey}",
        NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: "${sanitizedSystemPrompt}",
        NEXT_PUBLIC_MAIN_TITLE: "${sanitizedMainTitle}"
      }
    }]
  };
  EOF
  
  # Feedback
  echo "Ecosystem file ecosystem.config.js created successfully."
  
  # Start the application with PM2
  pm2 start ecosystem.config.js
  
  `;
  
    const scriptPath = `./setup_chatbot_${sanitizedPort}.sh`;
  
    writeFile(scriptPath, scriptContent, { mode: 0o755 }, (writeErr) => {
      if (writeErr) {
        console.error('Error writing script:', writeErr);
        return res.status(500).send('Error writing deployment script');
      }
    
      // Execute the script
      /* TODO not working..
      exec(`bash ${scriptPath}`, (execErr, stdout, stderr) => {
        if (execErr) {
          console.error('An error occurred:', execErr);
          return res.status(500).send('Error deploying chate');
        }
    
        console.log('Standard Output:', stdout);
        console.log('Standard Error:', stderr);
        res.send('chate deployed successfully');
      });
      */
    });
  })  

  export default app