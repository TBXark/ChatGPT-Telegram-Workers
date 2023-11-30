/* eslint-disable indent */
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import botRouter from './botRouter.js';
import utils from './utils.js';

import { exec } from 'child_process';

// Fix ReferenceError, because we cannot set __dirname directly in ES module.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/frontfiles')));
app.use('/bot', botRouter);

app.get('/updateserver_123', (req, res) => {
  exec('git stash && git pull && pm2 restart index -f', (err, stdout, stderr) => {
    if (err) {
      // Handle the error
      console.error('An error occurred:', err);
      return;
    }

    // Log the stdout and stderr streams
    console.log('Standard Output:', stdout);
    console.log('Standard Error:', stderr);
  });
});

app.get('/', (req, res) => {
  exec('git rev-parse HEAD', function (err, stdout) {
    console.log('Last commit hash on this branch is:', stdout);
  });
  res.sendFile(path.join(utils.getDirname(), '/wizard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), '/login.html'));
});

app.get('/wizard', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), '/wizard.html'));
});

const PORT = 3006;
app.listen(PORT, () => {
  console.log('github commit: revision');
  console.log(`Server running on http://localhost:${PORT}`);
});
