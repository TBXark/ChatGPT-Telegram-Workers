# Cloudflare Workers Deployment Guide

> If you need local deployment or Docker deployment, please refer to the [Local Deployment](LOCAL.md) documentation.
>
> If you need to deploy to Vercel, please check the [Vercel deployment example](../cn/VERCEL) documentation.


## Video tutorial

<a href="https://youtu.be/BvxrZ3WMrLE"><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223895059-1ffa48c7-8801-4d7b-b9d3-15c857d03225.png"></a>

Thank [**科技小白堂**](https://www.youtube.com/@lipeng0820) for providing this video tutorial.


## Manual deployment


### 1. Create a new Telegram bot, obtain the Token.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916992-b393178e-2c41-4a65-a962-96f776f652bd.png">

1. Open Telegram and send the `/start` command to BotFather.
2. Send the `/newbot` command and give your bot a name.
3. Give your bot a unique username ending with `_bot`.
4. BotFather will generate a Token; copy it and save it. This Token is the key linked to your bot, do not disclose it to others!
5. Later, in the Cloudflare Workers settings, fill this Token into the `TELEGRAM_AVAILABLE_TOKENS` variable.
6. If you need to support group chats or set up other Telegram Bot APIs, please refer to the [configuration documentation](CONFIG.md) to set the corresponding variables.


### 2. Register an OpenAI account and create an API Key.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917026-dd9bebcb-f4d4-4f8a-a836-5e89d220bbb9.png">

1. Open [OpenAI](https://platform.openai.com) to register an account.
2. Click on the avatar in the upper right corner to enter the personal settings page.
3. Click on API Keys to create a new API Key.
4. Later, in the Cloudflare Workers settings, fill this Token into the `OPENAI_API_KEY` variable.
5. If you are using third-party AI services, please refer to the [configuration document](CONFIG.md) to set the corresponding variables.


### 3. Deploy Workers
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917036-fe70d0e9-3ddf-4c4a-9651-990bb84e4e92.png">

1. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) and register an account.
2. Click on `Create a Service` in the upper right corner.
3. Enter the newly created workers, select `Quick Edit`, copy the code from [`../dist/index.js`](../../dist/index.js) into the editor, and save.


### 4. Configure environment variables
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916940-cc4ce79c-f531-4d73-a215-943cb394787a.png">

1. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers), click on your Workers, then click on the top right corner's Setting -> Variables.
2. Check the [configuration document](CONFIG.md) for the required environment variables that must be filled in.

### 5. Bind KVNamespace

1. In `Home-Workers-KV`, click on the `Create a Namespace` in the upper right corner, name it whatever you like, but it must be set to `DATABASE` when binding.<br><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916810-f31c4900-297b-4a33-8430-7c638e6f9358.png">
2. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) and click on your Workers.
3. Click in the upper right corner Setting -> Variables <br><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916832-697a7bb6-70e2-421d-b88e-899bd24007de.png">
4. In `KV Namespace Bindings`, click `Edit variables`.
5. Click `Add variable`.
6. Set the name to `DATABASE` and select the KV data you just created.


### 6. Initialization
1. Run `https://workers_name.username.workers.dev/init` to automatically bind the Telegram webhook and set all commands.


### 七. Start chatting
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917106-2bbc09ea-f018-489e-a7b9-317461348341.png">

1. Start a new conversation by using the `/new` command, and thereafter, the chat context will be sent to ChatGPT each time.
2. If you want to learn how to use other commands, please refer to the [configuration document](CONFIG.md).


## Command Line Deployment

1. Prepare the required Telegram Bot Token and OpenAI API Key
2. `mv wrangler-example.toml wrangler.toml`, then modify the corresponding configuration
3. `yarn install`
4. `yarn run deploy:build`
