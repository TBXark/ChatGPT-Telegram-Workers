# Deploy using Vercel (experimental)

The `/src/entry/vercel` provides sample code that can complete Vercel deployment and basic functional testing. However, it cannot guarantee that all functions will work properly.


### Automatic deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,VERCEL_DOMAIN,TELEGRAM_AVAILABLE_TOKENS&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)


### Manual deployment

```shell
yarn global add vercel   # Install the Vercel command-line tool.
yarn                     # Install dependencies.
yarn run build:vercel    # Compile code specifically for Vercel.
yarn run prepare:vercel  # Convert the wrangler.toml configuration file to Vercel env. This step will be particularly slow, so it is only necessary to run it when your wrangler.toml configuration changes.
yarn run deploy:vercel   # Deploy to Vercel.
```

### Known issue.

1. There is a problem with closing Redis connections, which can cause too many client connections and make it impossible to connect. It is recommended to use Upstash's Redis service.