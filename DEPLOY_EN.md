# Deployment Process

## Manual Deployment

### Step One: Create a Telegram Bot and Obtain a Token
<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222916992-b393178e-2c41-4a65-a962-96f776f652bd.png">

1. Open Telegram and send the `/start` command to BotFather.
2. Send the `/newbot` command to BotFather and give your bot a name.
3. Give your bot a unique username ending with `_bot`.
4. BotFather will generate a token. Copy and save it. This token is the key that binds the bot to your account. Do not disclose it to others!
5. Later, in the Cloudflare Workers settings, fill in the `TELEGRAM_TOKEN` variable with this token.
6. (Optional) In Telegram, find BotFather and send `/setcommands`. Find your bot and send `new - start a new conversation` to add a shortcut entry to `/new`.


### Step Two: Register with OpenAI and Create an API Key
<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222917026-dd9bebcb-f4d4-4f8a-a836-5e89d220bbb9.png">

1. Open [OpenAI](https://platform.openai.com) to register an account.
2. Click on the avatar in the upper right corner to enter the personal settings page.
3. Click on API Keys and create a new API Key.
4. Later, in the Cloudflare Workers settings, fill in the `API_KEY` variable with this key.


### Step Three: Deploy Workers
<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222917036-fe70d0e9-3ddf-4c4a-9651-990bb84e4e92.png">

1. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) to register an account.
2. Click on `Create a Service` in the upper right corner.
3. Enter the newly created workers, select `Quick Edit`, copy the [`./dist/index.js`](./dist/index.js) code into the editor, and save.


### Step Four: Configure Environment Variables
<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222916940-cc4ce79c-f531-4d73-a215-943cb394787a.png">

1. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) and click on your workers. Click on Setting -> Variables in the upper right corner.
2. `API_KEY`: Set it to the OpenAI API Key.
3. `TELEGRAM_TOKEN`: Set it to the Telegram Bot Token.
4. `WORKERS_DOMAIN`: Set it to your Workers domain, for example, `workers_name.username.workers.dev`. You can find it in the `Preview` of the workers details page.
5. `CHAT_WHITE_LIST`: Set it to the ID of the users who are allowed to access, for example, `123456789,987654321`. If you don't know your ID, use the `/new` command in a conversation with the bot to get it.
6. `I_AM_A_GENEROUS_PERSON`: If you still don't understand how to get the ID, you can set this value to `true` to turn off the whitelist function and allow everyone to access.


### Step Five: Bind KV Data
1. On the `Home-Workers-KV` page, click `Create a Namespace` in the upper right corner. You can name it whatever you like, but when binding, it must be set to `DATABASE`. <br><img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222916810-f31c4900-297b-4a33-8430-7c638e6f9358.png">
2. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) and click on your workers.
3. Click on Setting -> Variables in the upper right corner. <br><img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222916832-697a7bb6-70e2-421d-b88e-899bd24007de.png">
4. Click `Edit variables` in `KV Namespace Bindings`.
5. Click `Add variable`.
6. Set the name to `DATABASE` and select the KV data you just created.


### Step Six: Initialization
1. Run `https://workers_name.username.workers.dev/init` to bind Telegram.


### Step Seven. Starting a Chat

<img width="600" alt="image" src="https://user-images.githubusercontent.com/9513891/222917106-2bbc09ea-f018-489e-a7b9-317461348341.png">

1. To start a new conversation, use the `/new` command. The chat context will then be sent to ChatGPT every time.
2. Use the `/setenv KEY=VALUE` command to modify user settings, such as `SETENV SYSTEM_INIT_MESSAGE="Starting now, every sentence will end with 'meow'."`
3. Because every conversation includes all the historical records and may reach the 4096-token limit, it is recommended to clean up the history by using the `/new` command when there is nothing to discuss.

## Automatic Deployment

0. Steps one, two, and three are for manual deployment.
1. Modify the configuration file `wrangler.toml`.
2. Run `npm install && npm run build`.
3. Run `wrangler login`.
4. Run `wrangler publish`.