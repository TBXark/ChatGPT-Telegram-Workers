# ChatGPT-Telegram-Workers

[English Version](./doc/en/README.md)

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。
可以自定义系统初始化信息，让你调试好的性格永远不消失。

<img style="max-width: 600px;" alt="image" src="./doc/demo.jpg">


## 分支
- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) 经过测试基本没有BUG的版本
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev)    有一些新功能，但是没有经过完整的测试，基本可用的版本

## 配置
> 推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

详情见 [配置文档](./doc/CONFIG.md)

## 部署流程
详情见 [部署流程](./doc/DEPLOY.md)

## 自动更新
> 使用Github Action自动更新

详情见 [自动更新](./doc/ACTION.md)


## 支持的平台

### [Cloudflare Workers](https://workers.cloudflare.com/)

最简单的方法，本项目默认支持的部署方式，详情看[部署流程](./doc/DEPLOY.md)。免费，无需域名，无需服务器，无需配置本地开发环境。KV存储，无需数据库，但是有一定的存储限制，每天写入限制为1000次，不过对于聊天机器人来说，应该够用了。

### [Vercel](https://vercel.com/)

详情看[Vercel](./adapter/vercel/README.md)。免费，无需域名，无需服务器。需要配置本地开发环境部署，不能通过复制粘贴部署。无存储服务，需要自己配置数据库。可以使用[Redis Cloud](https://redis.com)的免费redis。可以连接github自动部署，但是需要了解vercel的配置。

### [Render](https://render.com/)

详情看[Render](./adapter/render)。免费，无需域名，无需服务器。需要有一定的开发能力。

### Local

详情看[Local](./adapter/local/README.md)。本地的部署方式，需要配置本地开发环境，需要有一定的开发能力。


## 更新日志
- v1.3.1
  - 优化历史记录裁剪逻辑
  - 优化token计算逻辑
  - 修复edit消息的bug
    
其他更新日志见[CHANGELOG.md](./doc/CHANGELOG.md)

## 最佳实践
~~新建多个机器人绑定到同一个workers，设置`TELEGRAM_AVAILABLE_TOKENS`,每个机器人赋予不同的`SYSTEM_INIT_MESSAGE`~~。开启群聊模式，新建多个群聊，每个群内只有自己个机器人，每个群的机器人由不同的`SYSTEM_INIT_MESSAGE`，比如翻译专家，文案专家，代码专家。然后每次根据自己的需求和不同的群里的机器人聊天，这样就不用经常切换配置属性。。

## 贡献者

这个项目存在是因为所有贡献者的帮助。[贡献](https://github.com/tbxark/ChatGPT-Telegram-Workers/graphs/contributors).

## 许可证

**ChatGPT-Telegram-Workers** 以 MIT 许可证的形式发布。[查看许可证](./LICENSE) 获取更多细节。