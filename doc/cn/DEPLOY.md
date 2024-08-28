# Cloudflare Workers 部署流程

> 如果你需要本地部署或者docker部署，请查看[本地部署](LOCAL.md)文档
> 
> 如果你需要部署到Vercel，请查看[Vercel部署示例](VERCEL)文档

## 视频教程

<a href="https://youtu.be/BvxrZ3WMrLE"><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223895059-1ffa48c7-8801-4d7b-b9d3-15c857d03225.png"></a>

感谢 [**科技小白堂**](https://www.youtube.com/@lipeng0820) 提供此视频教程
 

## 手动部署

### 1. 新建Telegram机器人, 获得Token
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916992-b393178e-2c41-4a65-a962-96f776f652bd.png">

1. 打开Telegram并向 BotFather 发送 `/start` 命令
2. 发送 `/newbot` 命令,并给你的机器人起一个名字 
3. 给你的机器人取一个唯一的用户名以`_bot`结尾
4. BotFather 会生成一个 Token,复制下来保存好,这个 Token 是和你的机器人绑定的密钥,不要泄露给他人！
5. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `TELEGRAM_AVAILABLE_TOKENS` 变量中
6. 如果你需要支持群聊或者设置其他Telegram Bot API,请查看[配置文档](CONFIG.md)设置对应变量

### 2. 注册OpenAI账号并创建API Key
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917026-dd9bebcb-f4d4-4f8a-a836-5e89d220bbb9.png">

1. 打开 [OpenAI](https://platform.openai.com) 注册账号
2. 点击右上角的头像,进入个人设置页面
3. 点击 API Keys,创建一个新的 API Key
4. 稍后再Cloudflare Workers 的设置里 将这个 Token 填入 `OPENAI_API_KEY` 变量中
5. 如果你使用第三方AI服务,请查看[配置文档](CONFIG.md)设置对应变量

### 3. 部署Workers
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917036-fe70d0e9-3ddf-4c4a-9651-990bb84e4e92.png">

1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 注册账号
2. 点击右上角的 `Create a Service`
3. 进入新建的workers, 选择`Quick Edit`, 将[`../dist/index.js`](../../dist/index.js)代码复制到编辑器中,保存


### 4. 配置环境变量
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916940-cc4ce79c-f531-4d73-a215-943cb394787a.png">

1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers,点击右上角的 Setting -> Variables
2. 查看[配置文档](CONFIG.md)设置必须填写的环境变量

### 5. 绑定KV数据
1. 在`首页-Workers-KV`, 点击右上角的 `Create a Namespace`, 名字随便取, 但是绑定的时候必须设定为`DATABASE`<br><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916810-f31c4900-297b-4a33-8430-7c638e6f9358.png">
2. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers
3. 点击右上角的 Setting -> Variables <br><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916832-697a7bb6-70e2-421d-b88e-899bd24007de.png">
4. 在 `KV Namespace Bindings` 中点击 `Edit variables`
5. 点击 `Add variable`
6. 设置名字为`DATABASE` 并选择刚刚创建的KV数据

### 6. 初始化
1. 运行 `https://workers_name.username.workers.dev/init` 自动绑定telegram的webhook和设定所有指令


### 七. 开始聊天
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222917106-2bbc09ea-f018-489e-a7b9-317461348341.png">

1. 开始新对话,使用`/new`指令开始,之后每次都会将聊天上下文发送到ChatGPT
2. 如果想了解其他指令的使用办法，请查看[配置文档](CONFIG.md)


## 命令行部署
1. 准备部署所需的 Telegram Bot Token 和 OpenAI API Key
2. `mv wrangler-example.toml wrangler.toml`, 然后修改相应配置
3. `yarn install`
4. `yarn run deploy:build`
