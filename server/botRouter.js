/* eslint-disable indent */
import fs from 'fs';
import path from 'node:path';
import request from 'request';
import { exec } from 'child_process';
import express from 'express';
import { body, validationResult } from 'express-validator';
import constants from './constants.js';
import utils from './utils.js';

const router = new express.Router();

router.post(
  '/',
  [
    body('access_code')
      .trim()
      .notEmpty()
      .escape()
      .matches(new RegExp(constants.accessCode))
      .withMessage('Enter a valid code'),
  ],
  async (req, res) => {
    const result = validationResult(req);

    if (result.errors.length) {
      return res.status(401).send(
        utils.returnErrorsHtmlPage({
          title: 'Not allowed',
        }),
      );
    }

    res.sendFile(path.join(utils.getDirname(), '/deploy.html'));
  },
);

router.post(
  '/deploy',
  [
    body('tg_token').notEmpty().withMessage('Please specify Telegram API token'),
    body('openai_sk').notEmpty().withMessage('Please specify OpenAI API key'),
    body('cf_account_id').notEmpty().withMessage('Please specify Cloudflare account ID'),
    body('cf_wrangler_key').notEmpty().withMessage('Please specify Cloudflare API key'),
  ],
  async (req, res) => {
    const useJSON = req.body.useJSON;
    console.log('>>> useJSON', req.body, useJSON);
    const result = validationResult(req);
    const msgErrors = result.errors.length && result.errors.map(({ msg }) => `<li>${msg}</li>`);

    if (msgErrors) {
      if (useJSON) {
        return res.status(200).json({
          error: true,
          messages: result.errors.map((error) => error.msg),
        });
      } else {
        return res.status(422).send(
          utils.returnErrorsHtmlPage({
            title: 'Not allowed. Fix these errors:',
            description: `
              <ul>
                ${msgErrors.join('')}
              </ul>
            `,
          }),
        );
      }
    }

    const initMessage = utils.escapeAttr(req.body.prompt).replace(/(?:\r\n|\r|\n)/g, '\\n');
    const openAiKey = utils.escapeAttr(req.body.openai_sk);
    const tgToken = utils.escapeAttr(req.body.tg_token);
    const cfWranglerKey = utils.escapeAttr(req.body.cf_wrangler_key);
    const cfAccountID = utils.escapeAttr(req.body.cf_account_id);
    // Payment related
    let freeMessages = Number(utils.escapeAttr(req.body.free_messages));
    let activationCode = utils.escapeAttr(req.body.activation_code).trim();
    let paymentLink = utils.escapeAttr(req.body.payment_link);

    if (
      !(
        typeof freeMessages === 'number' &&
        Number.isInteger(freeMessages) &&
        freeMessages > -1 &&
        freeMessages < Number.MAX_SAFE_INTEGER
      )
    ) {
      freeMessages = '';
    }

    if (
      !(
        typeof activationCode === 'string' &&
        activationCode.length > 4 &&
        activationCode.length < 64
      )
    ) {
      activationCode = '';
    }

    if (
      !(
        typeof paymentLink === 'string' &&
        paymentLink.match(
          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
        )
      )
    ) {
      paymentLink = '';
    }

    request(`${constants.telegramApi}/bot${tgToken}/getMe`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const userData = JSON.parse(body).result;
        const botUsername = userData.username.toLowerCase();
        const nm = `${botUsername}_${new Date().getMinutes()}_${new Date().getDate()}_${
          // +1 because first month starts from 0
          new Date().getMonth() + 1
        }_${new Date().getFullYear()}`;

        // TODO Check this and remove if unnecessary
        // Check form if all ok
        if (false) {
          return res.status(200).json({
            success: 'yes',
            botUsername,
          });
        }
        // Find if we already have such KV
        exec('wrangler kv:namespace list', async (error, stdout, stderr) => {
          const regex = new RegExp(nm);
          const match = regex.exec(stdout);

          if (match) {
            if (useJSON) {
              return res.status(200).json({
                error: true,
                messages: ['You have already deployed such a bot. (Try to make a different one)'],
              });
            } else {
              return res.status(400).send(
                utils.returnErrorsHtmlPage({
                  title: 'You have already deployed such a bot.',
                  description: `
                    <p>Try to make a different one</p>
                  `,
                }),
              );
            }
          }

          // We need to update wrangler config twice
          // 1. for to interact with the user account and create KV
          // 2. save KV data
          utils.writeWranglerFile({
            botName: botUsername,
            cfAccountID,
            // We don't know the KV data yet. But we cannot set an empty string.
            kvID: 'any',
            openAiKey,
            tgToken,
            initMessage,
            freeMessages,
            activationCode,
            paymentLink,
          });

          // Create a new namespace
          exec(
            `cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run wrangler kv:namespace create ${nm}`,
            (error, stdout, stderr) => {
              console.log('namespace creation error?: ', error);
              console.log('namespace creation stdout?: stdout', stdout);
              console.log('namespace creation stderr?: stderr', stderr);

              if (error) {
                console.error('Error on namespace creation. Error:', stdout);
                const errInfo = stderr.match(/\[ERROR].*/s);

                if (useJSON) {
                  return res.status(200).json({
                    error: true,
                    messages: [
                      'Something went wrong. Try again or contact support.',
                      `Failed to create a namespace. Error: ${error.message}${
                        errInfo ? `. ${errInfo[0]}` : ''
                      }`,
                    ],
                  });
                } else {
                  return res.status(500).send(
                    utils.returnErrorsHtmlPage({
                      title: 'Something went wrong. Try again or contact support.',
                      description: `
                    <p>Failed to create a namespace. Error: ${error.message}${
                        errInfo ? `. ${errInfo[0]}` : ''
                      }</p>
                  `,
                    }),
                  );
                }
              }

              console.log('no kv creation error found. ');
              // Find the ID in the stdout. Example of stdout:
              // ...
              // kv_namespaces = [
              //   { binding = "NAME", id = "12345abc..." }
              // ]
              const regex = /id = "(\w+)"/;
              const match = regex.exec(stdout);
              const id = match ? match[1] : null;

              if (!id && error) {
                console.error(`Error to retrieve the KV ID: ${error}`);
                if (useJSON) {
                  return res.status(200).json({
                    error: true,
                    messages: [`Failed to create a KV. ${error}`],
                  });
                } else {
                  return res.status(400).json({ error: `Failed to create a KV. ${error}` });
                }
              }

              utils.writeWranglerFile({
                botName: botUsername,
                cfAccountID,
                kvID: id,
                openAiKey,
                tgToken,
                initMessage,
                freeMessages,
                activationCode,
                paymentLink,
              });
              console.log('try to save src/env.js');
              fs.readFile('src/env.js', 'utf8', function (err, data) {
                if (err) {
                  console.error(err);
                  return;
                }
                // TODO fix this replacement. Allow changes through ENV file
                const updatedData = data.replace(
                  /(SYSTEM_INIT_MESSAGE: )('.*?')(,)/,
                  `SYSTEM_INIT_MESSAGE: '${initMessage}',`,
                );

                fs.writeFile('src/env.js', updatedData, 'utf8', function (err) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log('File updated successfully');
                });
              });

              exec(
                `cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run deploy:build`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec deploy error: ${error}`);

                    if (useJSON) {
                      return res.status(200).json({
                        error: true,
                        messages: [
                          `Something went wrong. Try again or contact support.`,
                          `Failed to deploy this bot.`,
                        ],
                      });
                    } else {
                      return res.status(500).send(
                        utils.returnErrorsHtmlPage({
                          title: 'Something went wrong. Try again or contact support.',
                          description: '<p>Failed to deploy this bot.</p>',
                        }),
                      );
                    }
                  }
                  console.log(
                    'cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run deploy:build comand has no errors. (ok)',
                  );

                  const workerDomain = stdout.match(/https:\/\/[a-z-A-Z0-9\-.]*\.workers\.dev/);

                  if (!workerDomain?.[0]) {
                    if (useJSON) {
                      return res.status(200).json({
                        error: true,
                        messages: [
                          `We did not able to activate your bot.`,
                          `You need to open a domain of a new bot worker and activate it or contact the support.`,
                        ],
                      });
                    } else {
                      return res.status(500).send(
                        utils.returnErrorsHtmlPage({
                          title: 'We did not able to activate your bot.',
                          description:
                            '<p>You need to open a domain of a new bot worker and activate it or contact the support.</p>',
                        }),
                      );
                    }
                  }

                  // Bot activation. This way, the user doesn't have to do it himself.
                  request(`${workerDomain?.[0]}/init`, (error) => {
                    if (error) {
                      console.error(`exec deploy error: ${error}`);
                      if (useJSON) {
                        return res.status(200).json({
                          error: true,
                          messages: [`Failed to initialize`],
                        });
                      } else {
                        return res.status(500).json({ error: 'Failed to initialize' });
                      }
                    }

                    if (useJSON) {
                      return res.status(200).json({
                        success: 'yes',
                        botUsername,
                      });
                    } else {
                      res.send(
                        utils.wrapInHtmlTemplate(`
                            <header>
                              <h2>Succesful deployment!</h2>
                            </header>
                            <main>
                              <p class='centered'>
                                <a href="https://t.me/${botUsername}" target='_blank' rel="noreferrer">Run your bot now</a>
                              </p>
                            </main>
                            <script>window.location="https://t.me/${botUsername}"</script>
                          `),
                      );
                    }
                  });
                },
              );
            },
          );
        });
      } else {
        console.error(error);
        if (useJSON) {
          return res.status(200).json({
            error: true,
            messages: [`Failed to get telegram bot name.`],
          });
        } else {
          return res.status(400).json({ error: 'Failed to get telegram bot name.' });
        }
      }
    });
  },
);

export default router;
