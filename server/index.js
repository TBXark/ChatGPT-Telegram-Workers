/* eslint-disable indent */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import express from 'express'
import botRouter from './botRouter.js'
import utils from './utils.js'
import { writeFile } from 'fs/promises';

// Set __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.disable('x-powered-by')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/frontfiles')))
app.use('/bot', botRouter)

app.get('/updateserver_123', (req, res) => {
  exec('git stash && git pull && pm2 restart index -f', (err, stdout, stderr) => {
    if (err) {
      console.error('An error occurred:', err)
      return res.status(500).send('Error updating server')
    }

    console.log('Standard Output:', stdout)
    console.log('Standard Error:', stderr)
    res.send('Server updated successfully')
  })
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), 'login.html'))
})

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
git clone https://github.com/noxonsu/chate/ "chate_${PORT}"

# Navigate to the project directory
cd "chate_${sanitizedPort}"

# Install dependencies
npm install

# Run the build command
npm run build

# Create the ecosystem file with the required content
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: "chat_$PORT",
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
    exec(`bash ${scriptPath}`, (execErr, stdout, stderr) => {
      if (execErr) {
        console.error('An error occurred:', execErr);
        return res.status(500).send('Error deploying chate');
      }
  
      console.log('Standard Output:', stdout);
      console.log('Standard Error:', stderr);
      res.send('chate deployed successfully');
    });
  });
})  

app.get('/', (req, res) => {
  exec('git rev-parse HEAD', function (err, stdout) {
    if (err) console.error(err)
    console.log('Last commit hash on this branch is:', stdout)
  })
  res.sendFile(path.join(utils.getDirname(), 'wizard.html'))
})

app.get('/wizard', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), 'wizard.html'))
})

const PORT = 3009
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
