# 使用Vercel部署 (实验性)

`/packages/app/vercel`中提供了示例代码，可以完成Vercel部署，和基础的功能测试。但是无法保证所有功能都能正常工作。

### 自动部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,TELEGRAM_AVAILABLE_TOKENS&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)

### 手动部署

```shell
pnpm install
pnpm deploy:vercel
```

1. pnpm deploy:vercel 过程中可能需要登陆Vercel账号
2. 首次部署由于缺少环境变量，页面会报错，需要手动前往Vercel控制台添加环境变量，然后重新部署生效
3. 你可以复用cloudflare workers的`wrangler.toml`配置文件，只需要执行`pnpm run vercel:syncenv`即可同步环境变量到Vercel, vercel修改环境变量后需要重新部署才能生效