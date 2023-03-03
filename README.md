# ChatGPT-Telegram-Workers

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。

![](./demo.jpg)

### 配置

偷懒的话可以直接复制代码然后修改相应的KEY，想要动态变化可以设置成环境变量
```js
// 你也可以注释这两行代码，然后在Workers配置界面填写环境变量
const API_KEY = "PLEASE_REPLACE_WITH_YOUR_OPENAI_API_KEY";
const TELEGRAM_TOKEN = "PLEASE_REPLACE_WITH_YOUR_TELEGRAM_BOT_TOKEN";

// 聊天白名单，你也可以在环境变量中定义数组然后在这里解析JSON
const CHAT_WHITE_LIST = [];
```

### 使用

1. 新建Telegram机器人, 获得Token
2. 注册OpenAI账号并创建API Key
3. 部署Workers https://developers.cloudflare.com/workers/
4. 运行 https://your_workers_name.your_workers_subdomain.workers.dev/telegram/your_telegram_bot_token/bind 绑定telegram
5. 开始新对话
使用`/new`指令开始，之后每次都会将聊天上下文发送到ChatGPT
