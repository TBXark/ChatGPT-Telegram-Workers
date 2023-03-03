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
    1. 打开Telegram并向 BotFather 发送 `/start` 命令
    2. 发送 `/newbo`t 命令，并给你的机器人起一个名字
    3. 给你的机器人取一个唯一的用户名
    4. BotFather 会生成一个 Token，复制下来保存好，这个 Token 是和你的机器人绑定的密钥，不要泄露给他人！
    5. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `TELEGRAM_TOKEN` 变量中
    6. 在Telegram中找到BotFather, 发送`/setcommands`, 找到自己的机器人, 发送`new - 开始新对话`
2. 注册OpenAI账号并创建API Key
    1. 打开 [OpenAI](https://platform.openai.com) 注册账号
    2. 点击右上角的头像，进入个人设置页面
    3. 点击 API Keys，创建一个新的 API Key
    4. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `API_KEY` 变量中
3. [部署Workers](https://developers.cloudflare.com/workers/)
    1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 注册账号
    2. 点击右上角的 Create a Worker
    3. 将代码复制到编辑器中，保存
4. [配置环境变量](https://developers.cloudflare.com/workers/platform/environment-variables/)(Settings-Variables-Environment Variables)，设置`API_KEY`，`TELEGRAM_TOKEN`,`WORKERS_DOMAIN`,`CHAT_WHITE_LIST`
    1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers，点击右上角的 Setting -> Variables
    2. `API_KEY`：设置成 OpenAI API Key
    3. `TELEGRAM_TOKEN`：设置成 Telegram Bot Token
    4. `WORKERS_DOMAIN`：设置成你的Workers域名，例如`your_workers_name.your_workers_subdomain.workers.dev`
    5. `CHAT_WHITE_LIST`：设置成你想要使用机器人的聊天ID，例如`123456789,987654321`，可以在Telegram中使用`/new`指令获取
5. [绑定KV数据](https://dash.cloudflare.com/:account/workers/kv/namespaces)(Settings-Variables-KV Namespace Bindings),名字设置为`DATABASE`
    1. 点击右上角的 Create a Namespace
    2. 设置名字为`DATABASE`
    3. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers
    4. 点击右上角的 Setting -> Variables
    5. 在 KV Namespace Bindings 中点击 Edit variables
    6. 点击 Add variable
    7. 设置名字为`DATABASE` 并选择刚刚创建的KV数据
6. 运行 `https://your_workers_name.your_workers_subdomain.workers.dev/init` 绑定telegram
8. 开始新对话，使用`/new`指令开始，之后每次都会将聊天上下文发送到ChatGPT
