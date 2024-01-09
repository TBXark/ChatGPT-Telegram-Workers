/* eslint-disable indent */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import express from 'express'
import botRouter from './botRouter.js'
import utils from './utils.js'

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
  // Extract inputs from query parameters or body
  const port = req.query.port;
  const apiKey = req.query.apiKey;
  const systemPrompt = req.query.systemPrompt;
  const mainTitle = req.query.mainTitle;

  // Validate and sanitize the inputs
  const sanitizedPort = parseInt(port, 10);
  if (isNaN(sanitizedPort) || sanitizedPort < 10024 || sanitizedPort > 65535) {
    return res.status(400).send('Invalid port number');
  }

  const sanitizedApiKey = sanitizeText(apiKey); // Implement sanitizeText function
  const sanitizedSystemPrompt = sanitizeText(systemPrompt); // Implement sanitizeText function
  const sanitizedMainTitle = sanitizeText(mainTitle); // Implement sanitizeText function

  // Prepare the command with sanitized inputs
  const command = `pm2 start npm --name "${sanitizedPort}_${
    sanitizedMainTitle}" -- run devcustomport --PORT=${sanitizedPort} --OPENAI_API_KEY=${
    sanitizedApiKey} --NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT="${
    sanitizedSystemPrompt}" --NEXT_PUBLIC_MAIN_TITLE="${sanitizedMainTitle}"`;
  

  // Execute the command
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('An error occurred:', err)
      return res.status(500).send('Error updating server')
    }

    console.log('Standard Output:', stdout)
    console.log('Standard Error:', stderr)
    res.send('chate deploy successfully')
  });
});

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

const PORT = 3006
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
