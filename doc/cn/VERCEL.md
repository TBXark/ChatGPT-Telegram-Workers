# 使用Vercel部署 (实验性)

`/src/entry/vercel`中提供了示例代码，可以完成Vercel部署，和基础的功能测试。但是无法保证所有功能都能正常工作。

### 自动部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,VERCEL_DOMAIN,TELEGRAM_AVAILABLE_TOKENS&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)


### 手动部署

```shell
yarn global add vercel   # 安装vercel命令行工具
yarn                     # 安装依赖
yarn run build:vercel    # 编译vercel专用的代码
yarn run prepare:vercel  # 转换wrangler.toml配置文件到 vercel env, 这一步会特别慢, 所以只有当你的wrangler.toml配置发生变化时才需要运行
yarn run deploy:vercel   # 部署到vercel
```

### 已知问题

1. redis 连接关闭有问题会导致客户端连接数过多导致无法连接建议使用upstash的redis服务