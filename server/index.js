/* eslint-disable indent */
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import botRouter from './botRouter.js';
import constants from './constants.js';
import utils from './utils.js';

// Fix ReferenceError, because we cannot set __dirname directly in ES module.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/bot', botRouter);

app.get('/', (req, res) => {
  res.send(
    utils.wrapInHtmlTemplate(`
    <header class="">
      <h2>Log into deployment page</h2>
    </header>
    <main>
      <section class="accessSection">
        <form method="post" action="bot" class='accessForm'>
          <input type='text' name='access_code' placeholder='Access code'>
          <br />
          <input type='submit' value='Login' class='primaryBtn'>
        </form>

        <p>
          Do not have any code?
          <a href="${constants.accessCodePaymentLink}" target=_blank>
            <strong>Get it here</strong>
          </a>
        </p>
      </section>
    </main>
  `),
  );
});

app.listen(3006, () => {
  console.log('Server running on port 3006');
});
