# ChatGPT-Telegram-Workers

[English Version](./doc/en/README.md)

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。
可以自定义系统初始化信息，让你调试好的性格永远不消失。

<details>
<summary>查看Demo</summary>
<img style="max-width: 600px;" alt="image" src="./doc/demo.jpg">
</details>

## 使用说明

### 分支

- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) 稳定版
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev)    开发版，可能会有一些新功能，但是不稳定。会快速修复一些bug。

### 配置

> 推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

配置信息和命令使用说明，见 [配置文档](./doc/CONFIG.md)

### 部署流程

详情见 [部署流程](./doc/DEPLOY.md)

如果需要部署在其他平台可以查看 [多平台部署](./doc/PLATFORM.md)

### 自动更新

> 使用`Github Action`自动更新 `Cloudflare Workers`

详情见 [自动更新](./doc/ACTION.md)

### 支持的平台


## 更新日志

- v1.5.0
  - perf: 调整命令顺序
  - perf: openai发送请求前前发送loading消息
  - feat: 添加流式输出支持(默认开启)。使用`STREAM_MODE=false`关闭
  - feat: 添加安全模式(默认开启)解决TG无限重试的问题
  - feat: 增加对多个KEY的适配，随机选择KEY使用
  - feat: 增加快捷按钮 `/new`, `/redo`

其他更新日志见[CHANGELOG.md](./doc/CHANGELOG.md)

## 最佳实践

~~新建多个机器人绑定到同一个workers，设置`TELEGRAM_AVAILABLE_TOKENS`,每个机器人赋予不同的`SYSTEM_INIT_MESSAGE`~~。开启群聊模式，新建多个群聊，每个群内只有自己个机器人，每个群的机器人由不同的`SYSTEM_INIT_MESSAGE`，比如翻译专家，文案专家，代码专家。然后每次根据自己的需求和不同的群里的机器人聊天，这样就不用经常切换配置属性。

## 支持我

如果使用openai期间需要绑卡可以使用我的onekey的邀请码: <https://card.onekey.so/?i=QO19EC> 如果有其他问题可以加群交流。

## 特别鸣谢

![https://www.jetbrains.com/?from=tbxark](https://user-images.githubusercontent.com/9513891/236592683-1ea579cf-08ff-4703-b313-db038f62bab0.svg)

感谢 [JetBrains](https://www.jetbrains.com/?from=tbxark) 提供的开源开发许可证。

## 贡献者

这个项目存在是因为所有贡献者的帮助。[贡献](https://github.com/tbxark/ChatGPT-Telegram-Workers/graphs/contributors).

## 许可证

**ChatGPT-Telegram-Workers** 以 MIT 许可证的形式发布。[查看许可证](./LICENSE) 获取更多细节。
