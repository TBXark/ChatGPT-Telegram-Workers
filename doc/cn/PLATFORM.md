# 支持平台

### 1. [Cloudflare Workers](https://workers.cloudflare.com/)

最简单的方法，本项目默认支持的部署方式，详情看[部署流程](DEPLOY.md)。免费，无需域名，无需服务器，无需配置本地开发环境。KV存储，无需数据库，但是有一定的存储限制，
> KV每天写入限制为1000次，不过对于聊天机器人来说，应该够用了。(调试模式`DEBUG_MODE`会保存最新一条消息到KV，token统计每次对话成功都会更新统计数据，所以会有一定的写入次数。如果你经常使用次数超过1000次，可以考虑关闭调试模式和者使用统计)

### 2. [Vercel](https://vercel.com/)

详情看[Vercel](../../adapter/vercel/README.md)。免费，无需域名，无需服务器。需要配置本地开发环境部署，不能通过复制粘贴部署。无存储服务，需要自己配置数据库。可以使用[Redis Cloud](https://redis.com)的免费redis。可以连接github自动部署，但是需要了解vercel的配置。


### 3. Local

详情看[Local](../../adapter/debug/README.md)。本地的部署方式，需要配置本地开发环境，需要有一定的开发能力。支持docker部署。
