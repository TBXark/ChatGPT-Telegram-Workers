# Deploy using Vercel (Experimental)

The sample code provided in `/packages/app/vercel` can complete the Vercel deployment and basic functionality testing. However, it cannot guarantee that all features will work normally.

### Automatic Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,TELEGRAM_AVAILABLE_TOKENS&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)

### Manual deployment

```shell
pnpm install
pnpm deploy:vercel
```
1. You may need to log in to your Vercel account during the pnpm deploy:vercel process.
2. For the first deployment, due to missing environment variables, the page will report errors. You need to manually go to the Vercel console to add environment variables, and then redeploy to take effect.
3. You can reuse the `wrangler.toml` configuration file of Cloudflare Workers, just need to execute `pnpm run vercel:syncenv` to synchronize environment variables to Vercel. After Vercel modifies the environment variables, a redeployment is required for them to take effect.