/* eslint-disable indent */
import express from 'express';
import botRouter from './botRouter.js';
import constants from './constants.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/bot', botRouter);

app.get('/', (req, res) => {
  res.send(`
    <section>
      <h2>Enter an access code</h2>

      <form method="post" action="bot">
        <input type='text' name='access_code' placeholder='Access code'>
        <input type='submit' value='Login'>
      </form>

      <p>
        Do not have any code?
        <br />
        <a href="${constants.accessCodePaymentLink}" target=_blank>Get access code</a>
      </p>
    </section>
  `);
});

app.listen(3006, () => {
  console.log('Server running on port 3006');
});
