# 支持平台

### 1. [Cloudflare Workers](https://workers.cloudflare.com/)

最简单的方法，本项目默认支持的部署方式，详情看[部署流程](DEPLOY.md)。免费，无需域名，无需服务器，无需配置本地开发环境。KV存储，无需数据库，但是有一定的存储限制，


### 2. [Vercel](https://vercel.com/)

详情看[Vercel](VERCEL.md)。免费，无需域名，无需服务器。需要配置本地开发环境部署，不能通过复制粘贴部署。无存储服务，需要自己配置数据库。可以使用[UpStash Redis](https://upstash.com)的免费redis。可以连接github自动部署，但是需要了解vercel的配置。


### 3. Local

详情看[Local](LOCAL.md)。本地的部署方式，需要配置本地开发环境，需要有一定的开发能力。支持docker部署。
