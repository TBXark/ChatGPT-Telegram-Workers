# 部署流程

### 一. 新建Telegram机器人, 获得Token
1. 打开Telegram并向 BotFather 发送 `/start` 命令
2. 发送 `/newbot` 命令，并给你的机器人起一个名字
3. 给你的机器人取一个唯一的用户名
4. BotFather 会生成一个 Token，复制下来保存好，这个 Token 是和你的机器人绑定的密钥，不要泄露给他人！
5. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `TELEGRAM_TOKEN` 变量中
6. 在Telegram中找到BotFather, 发送`/setcommands`, 找到自己的机器人, 发送`new - 开始新对话`

### 二. 注册OpenAI账号并创建API Key
1. 打开 [OpenAI](https://platform.openai.com) 注册账号
2. 点击右上角的头像，进入个人设置页面
3. 点击 API Keys，创建一个新的 API Key
4. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `API_KEY` 变量中

### 三. 部署Workers
1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 注册账号
2. 点击右上角的 Create a Worker
3. 将代码复制到编辑器中，保存

### 四. 配置环境变量
[配置环境变量](https://developers.cloudflare.com/workers/platform/environment-variables/)(Settings-Variables-Environment Variables)，设置`API_KEY`，`TELEGRAM_TOKEN`,`WORKERS_DOMAIN`,`CHAT_WHITE_LIST`
1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers，点击右上角的 Setting -> Variables
2. `API_KEY`：设置成 OpenAI API Key
3. `TELEGRAM_TOKEN`：设置成 Telegram Bot Token
4. `WORKERS_DOMAIN`：设置成你的Workers域名，例如`workers_name.username.workers.dev`
5. `CHAT_WHITE_LIST`：设置成允许访问的用户的ID，例如`123456789,987654321`，可以在和你的机器人聊天中使用`/new`指令获取

### 五. 绑定KV数据

[绑定KV数据](https://dash.cloudflare.com/:account/workers/kv/namespaces)
Settings-Variables-KV Namespace Bindings,名字设置为`DATABASE`
1. 点击右上角的 Create a Namespace, 名字随便取, 但是绑定的时候必须设定为DATABASE
2. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers
3. 点击右上角的 Setting -> Variables
4. 在 KV Namespace Bindings 中点击 Edit variables
5. 点击 Add variable
6. 设置名字为`DATABASE` 并选择刚刚创建的KV数据

### 六. 初始化

运行 `https://workers_name.username.workers.dev/init` 绑定telegram


### 七. 开始聊天

1. 开始新对话，使用`/new`指令开始，之后每次都会将聊天上下文发送到ChatGPT
2. 使用`SETENV KEY=VALUE`指令修改用户配置，例如`SETENV SYSTEM_INIT_MESSAGE=现在开始是喵娘，每句话已喵结尾


