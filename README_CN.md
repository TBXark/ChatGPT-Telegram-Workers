<h1 align="center">
ChatGPT-Telegram-Workers
</h1>

<p align="center">
    <br> <a href="README.md">English</a> | 中文
</p>
<p align="center">
    <em>轻松在Cloudflare Workers上部署您自己的Telegram ChatGPT机器人。</em>
</p>


## 关于

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。 可以自定义系统初始化信息，让你调试好的性格永远不消失。

<details>
<summary>查看Demo</summary>
<img style="max-width: 600px;" alt="image" src="doc/demo.jpg">
</details>


## 特性

- 无服务器部署
- 多平台部署支持(Cloudflare Workers, Vercel, Docker[...](doc/cn/PLATFORM.md))
- 适配多种AI服务商(OpenAI, Azure OpenAI, Cloudflare AI, Cohere, Anthropic, Mistral...)
- 使用 InlineKeyboards 切换模型
- 自定义指令(可以实现快速切换模型,切换机器人预设)
- 支持多个Telegram机器人
- 流式输出
- 多语言支持
- 文字生成图片
- [插件系统](plugins),可以自定义插件


## 文档

- [部署Cloudflare Workers](./doc/cn/DEPLOY.md)
- [本地(或Docker)部署](./doc/cn/LOCAL.md)
- [部署其他平台](./doc/cn/PLATFORM.md)
- [配置参数和指令](./doc/cn/CONFIG.md)
- [自动更新](./doc/cn/ACTION.md)
- [变更日志](./doc/cn/CHANGELOG.md)


## 关联项目

- [cloudflare-worker-adapter](https://github.com/TBXark/cloudflare-worker-adapter)  一个简单的Cloudflare Worker适配器,让本项目脱离Cloudflare Worker独立运行
- [telegram-bot-api-types](https://github.com/TBXark/telegram-bot-api-types)  编译后0输出的Telegram Bot API SDK, 文档齐全,支持所有API


## 特别感谢

![https://www.jetbrains.com/?from=tbxark](https://user-images.githubusercontent.com/9513891/236592683-1ea579cf-08ff-4703-b313-db038f62bab0.svg)

感谢[JetBrains](https://www.jetbrains.com/?from=tbxark)提供的开源开发许可证。


## 贡献者

这个项目存在是因为所有贡献的人。[贡献](https://github.com/tbxark/ChatGPT-Telegram-Workers/graphs/contributors)。


## 许可证

**ChatGPT-Telegram-Workers** 以 MIT 许可证发布。[详见 LICENSE](LICENSE) 获取详情。
