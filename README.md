# ChatGPT-Telegram-Workers

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。
可以自定义系统初始化信息，让你调试好的性格永远不消失。

![](./demo.jpg)



### 配置

推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

#### 系统配置
为每个用户通用的配置，通常在workers配置界面填写
|KEY|说明|类型|特殊说明|
|--|--|--|--|
|API_KEY|OpenAI API Key|Environment Variables||
|TELEGRAM_TOKEN|Telegram Bot Token|Environment Variables||
|WORKERS_DOMAIN|Workers域名|Environment Variables|不要加上https://|
|CHAT_WHITE_LIST|聊天ID白名单|Environment Variables|多个ID用`,`分隔，不知道ID，和机器人聊一句就能返回|
|I_AM_A_GENEROUS_PERSON|关闭白名单，允许所有人访问|Environment Variables|鉴于很多人不想设置白名单，或者不知道怎么获取ID，所以设置这个选项就能允许所有人访问， 值为`true`时生效|
|DATABASE|KV数据|KV Namespace Bindings|先新建KV，新建的时候名字随意，然后绑定的时候必须设定为DATABASE|

#### 用户配置
每个用户的自定义配置，只能通过Telegram发送消息来修改，消息格式为`SETENV KEY=VALUE`
|KEY|说明|例子|
|--|--|--|
|SYSTEM_INIT_MESSAGE|系统初始化参数，设定后就算开启新会话还能保持，不用每次都调试|SETENV SYSTEM_INIT_MESSAGE=现在开始是喵娘，每句话已喵结尾|
|OPENAI_API_EXTRA_PARAMS|OpenAI API额外参数，设定后每次调用API都会带上，可以用来调整温度等参数|SETENV OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}, 每次修改必须为完整JSON｜



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
    1. 点击右上角的 Create a Namespace, 名字随便取, 但是绑定的时候必须设定为DATABASE
    2. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) 点击你的Workers
    3. 点击右上角的 Setting -> Variables
    4. 在 KV Namespace Bindings 中点击 Edit variables
    5. 点击 Add variable
    6. 设置名字为`DATABASE` 并选择刚刚创建的KV数据
6. 运行 `https://workers_name.username.workers.dev/init` 绑定telegram
8. 开始新对话，使用`/new`指令开始，之后每次都会将聊天上下文发送到ChatGPT
9. 使用`SETENV KEY=VALUE`指令修改用户配置，例如`SETENV SYSTEM_INIT_MESSAGE=现在开始是喵娘，每句话已喵结尾
