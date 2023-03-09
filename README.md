# ChatGPT-Telegram-Workers

[English Version](./doc/en/README.md)

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。
可以自定义系统初始化信息，让你调试好的性格永远不消失。

<img style="max-width: 600px;" alt="image" src="./doc/demo.jpg">


## 分支
- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) 经过测试基本没有BUG的版本
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev)    有一些新功能，但是没有经过完整的测试，基本可用的版本

## 配置
推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量
详情见 [配置](./doc/CONFIG.md)

## 部署流程
详情见 [部署流程](./doc/DEPLOY.md)

## 自动更新
使用Github Action自动更新，详情见 [自动更新](./doc/ACTION.md)

## 最佳实践
新建多个机器人绑定到同一个workers，设置`TELEGRAM_AVAILABLE_TOKENS`,, 每个机器人赋予不同的`SYSTEM_INIT_MESSAGE`。比如翻译专家，文案专家，代码专家。然后每次根据自己的需求和不同的机器人聊天，这样就不用经常切换配置属性。。

## 已知问题
- ~~群消息只能管理员调用bot~~
- 长消息被Telegram截断

## 更新日志
- v1.2.0
    - 修复高危漏洞，必须更新
    
其他更新日志见[CHANGELOG.md](./doc/CHANGELOG.md)
