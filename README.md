# ChatGPT-Telegram-Workers

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。

![](./demo.jpg)

### 配置

偷懒的话可以直接复制代码然后修改相应的KEY，想要动态变化可以设置成环境变量
```js
// 你在这代码直接添加信息，或者Workers配置界面填写环境变量， 环境变量的优先级比较高
// OpenAI API Key
let API_KEY = "PLEASE_REPLACE_WITH_YOUR_OPENAI_API_KEY";
// Telegram Bot Token
let TELEGRAM_TOKEN = "PLEASE_REPLACE_WITH_YOUR_TELEGRAM_BOT_TOKEN";
// Workers Domain
let WORKERS_DOMAIN="your_workers_name.your_workers_subdomain.workers.dev"
// Chat White List, 在环境变量中配置时用英文逗号分隔
let CHAT_WHITE_LIST = [];
// KV Namespace Bindings 
let DATABASE = null;

```

### 使用

1. 新建Telegram机器人, 获得Token
2. 注册OpenAI账号并创建API Key
3. [部署Workers](https://developers.cloudflare.com/workers/)
4. [配置环境变量](https://developers.cloudflare.com/workers/platform/environment-variables/)(Settings-Variables-Environment Variables)，设置`API_KEY`，`TELEGRAM_TOKEN`,`WORKERS_DOMAIN`,`CHAT_WHITE_LIST`
5. [绑定KV数据](https://developers.cloudflare.com/workers/runtime-apis/kv#kv-bindings)(Settings-Variables-KV Namespace Bindings),名字设置为`DATABASE`
6. 运行 https://your_workers_name.your_workers_subdomain.workers.dev/init 绑定telegram
7. 在telegram中找到BotFather, 发送`/setcommands`, 找到自己的机器人, 发送`new - 开始新对话`
8. 开始新对话，使用`/new`指令开始，之后每次都会将聊天上下文发送到ChatGPT
