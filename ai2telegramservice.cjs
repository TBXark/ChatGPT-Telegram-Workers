/* eslint-disable indent */
const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const request = require('request');

const { htmlEncode } = require('js-htmlencode');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function esc_attr(str) {
  return htmlEncode(str);
}

app.post(
  '/submit-form',
  [
    body('tg_token').notEmpty().withMessage('Please specify telegram API token'),
    body('openai_sk').notEmpty().withMessage('no openai_sk'),
    body('cf_wrangler_key').notEmpty().withMessage('no cf_wrangler_key'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const tg_token = esc_attr(req.body.tg_token);
    const cf_wrangler_key = esc_attr(req.body.cf_wrangler_key);

    let api_response;
    const initmessage = esc_attr(req.body.prompt).replace(/(?:\r\n|\r|\n)/g, '\\n');
    //telegram api get bit name by api key
    const api_url = `https://api.telegram.org/bot${tg_token}/getMe`;
    let bot_username;

    await request(api_url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body).result;
        bot_username = data.username.toLowerCase();
        console.log(`Bot username: ${bot_username}`);

        const nm = `${bot_username}_${new Date().getMinutes()}_${new Date().getDate()}_${new Date().getMonth()}_${new Date().getFullYear()}`;

        console.log('nm:' + nm);

        const { exec } = require('child_process');

        exec(`CLOUDFLARE_API_TOKEN=${cf_wrangler_key} npm run wrangler kv:namespace create ${nm}`, (error, stdout, stderr) => {
          
          // Find the ID in the stdout
          const regex = /id = "(\w+)"/;
          const match = regex.exec(stdout);
          const id = match ? match[1] : null;

          console.log(`Namespace ID: ${id}`);

          if (!id && error) {
            console.error(`exec error: ${error}`);
            return res.status(400).json({ error: `Failed to create a KV. ${error}` });
          }


          fs.writeFileSync(
            `wrangler.toml`,
            `name = "chatgpt-telegram-${bot_username}"
compatibility_date = "2023-03-04"
main = "./dist/index.js"
workers_dev = true

kv_namespaces = [
	{ binding = "DATABASE", id = "${id}" }
]

[vars]

API_KEY = "${esc_attr(req.body.openai_sk)}"
TELEGRAM_AVAILABLE_TOKENS = "${tg_token}"
CHAT_WHITE_LIST = ""
I_AM_A_GENEROUS_PERSON = "true"
# AUTO_TRIM_HISTORY = "false"
# MAX_HISTORY_LENGTH = "20"
# DEBUG_MODE = "false"
# CHAT_MODEL = "gpt-3.5-turbo"
SYSTEM_INIT_MESSAGE ="${initmessage}"

# GROUP_CHAT_BOT_ENABLE = "true"
# TELEGRAM_BOT_NAME = ""
# GROUP_CHAT_BOT_SHARE_MODE = "false"
# CHAT_GROUP_WHITE_LIST = "false"
`,
          );

          fs.readFile('src/env.js', 'utf8', function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            
            
            const updatedData = data.replace(/(SYSTEM_INIT_MESSAGE: )('.*?')(,)/,   `SYSTEM_INIT_MESSAGE: '${initmessage}',`);
        
            fs.writeFile('src/env.js', updatedData, 'utf8', function(err) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('File updated successfully');
            });
        });

          exec(
            `CLOUDFLARE_API_TOKEN=${cf_wrangler_key} npm run deploy:build`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec deploy error: ${error}`);
                return res.status(400).json({ error: 'Failed to npm run deploy.' });
                }
                console.log(stdout);
                const regex1 = /id = "Published (.*?) "/;
                const match1= regex1.exec(stdout);
                
                request(`https://chatgpt-telegram-${bot_username}.onout.workers.dev/init`, function(error, response, body) {
                   if (error) {
                  console.error(`exec deploy error: ${error}`);
                  return res.status(400).json({ error: 'Failed to npm run deploy.' });
                  }
                
                  console.log("INIT BOT",response.body)
                  res.send(`<h1>deploy success! <a href="https://t.me/${bot_username}">Run now</a></h1><script>window.location="https://t.me/${bot_username}"</script>`);
              
                });
            },
          );
        });
      } else {
        console.error(error);
        return res.status(400).json({ error: 'Failed to get telegram bot name.' });
      }
    });
  },
);

app.get('/', (req, res) => {
  res.send(`
    <form method="post" action="submit-form">
      <br>
      telegram bot API token. <a href="https://t.me/BotFather" target=_blank>Get at BotFather</a><br>
      <input type='text' style='width:500px' name='tg_token' placeholder='57707394230:AAE33330Myi4tglJCdUrt9hsJd6J6Jo3D2tQ' value=''> <Br>
      <br>
      openAI API key <a href="https://platform.openai.com/" target=_blank>Get </a><br>
      <input type='text' style='width:500px' name='openai_sk' required placeholder='' value=''> <Br>
      <Br>
      Cloudflare API token <a href="https://cloudflare.com/" target=_blank>Get </a><br>
      <input type='text' style='width:500px' name='cf_wrangler_key' required placeholder='' value=''> <Br>
      <Br>
      Prompt <a href="" target=_blank>examples</a>: <Br>
      <textarea style='width:500px;height:300px' name='prompt'></textarea>
      <br><br>
      <input type='submit' value='Send'>
    </form>
  `);
});

if (process.env.EC2_AMAZON_LINUX_AMI) {
  app.listen(80, '0.0.0.0', () => {
    console.log('Server running on port 80');
  });
} else {
  app.listen(3006, () => {
    console.log('Server running on port 3006');
  });
}



