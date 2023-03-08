# ChatGPT-Telegram-Workers
[![Test](https://github.com/TBXark/ChatGPT-Telegram-Workers/actions/workflows/cloudflare.yml/badge.svg)](https://github.com/TBXark/ChatGPT-Telegram-Workers/actions/workflows/cloudflare.yml)

[English Version](./doc/README_EN.md)

最简单快捷部署属于自己的ChatGPT Telegram机器人的方法。使用Cloudflare Workers，单文件，直接复制粘贴一把梭，无需任何依赖，无需配置本地开发环境，不用域名，免服务器。
可以自定义系统初始化信息，让你调试好的性格永远不消失。

![](./doc/demo.jpg)

## 分支
- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) 经过测试基本没有BUG的版本
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev)    有一些新功能，但是没有经过完整的测试，基本可用的版本

## 配置

推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

#### 系统配置
为每个用户通用的配置，通常在workers配置界面填写

|KEY|说明|类型|特殊说明|
|--|--|--|--|
|API_KEY|OpenAI API Key|Environment Variables||
|~~TELEGRAM_TOKEN~~|Telegram Bot Token|Environment Variables|`已废弃`,提供兼容性代码,可用`TELEGRAM_AVAILABLE_TOKENS`代替|
|TELEGRAM_AVAILABLE_TOKENS|支持多个Telegram Bot Token|Environment Variables|多个Token用`,`分隔|
|~~WORKERS_DOMAIN~~|Workers域名|Environment Variables|`已废弃`|
|CHAT_WHITE_LIST|聊天ID白名单|Environment Variables|多个ID用`,`分隔，不知道ID，和机器人聊一句就能返回|
|I_AM_A_GENEROUS_PERSON|关闭白名单，允许所有人访问|Environment Variables|鉴于很多人不想设置白名单，或者不知道怎么获取ID，所以设置这个选项就能允许所有人访问， 值为`true`时生效|
|AUTO_TRIM_HISTORY|自动清理历史记录|Environment Variables|为了避免4096字符限制，将消息删减|
|MAX_HISTORY_LENGTH|最大历史记录长度|Environment Variables|`AUTO_TRIM_HISTORY开启后` 为了避免4096字符限制，将消息删减|
|DEBUG_MODE|调试模式|Environment Variables|目前可以把最新一条消息保存到KV方便调试|
|DATABASE|KV数据|KV Namespace Bindings|先新建KV，新建的时候名字随意，然后绑定的时候必须设定为DATABASE|

#### 群组配置
可以把机器人加到群组中，然后群组里的所有人都可以和机器人聊天。
> BREAKING CHANGE:
> 重大改动，必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

> IMPORTANT：受限TG的隐私安全策略，如果你的群组是公开群组或超过2000人，请将机器人设置为`管理员`，否则机器人无法响应`@机器人`的聊天消息。


|KEY|说明|类型|特殊说明|
|--|--|--|--|
|GROUP_CHAT_BOT_ENABLE|开启群组机器人|Environment Variables|开启后，机器人加入群组后，然后群组里的所有人都可以和机器人聊天。默认:`true`|
|~~BOT_NAME~~|机器人名字 xxx_bot|Environment Variables|`已废弃`,提供兼容性代码,可用`TELEGRAM_BOT_NAME`代替|
|TELEGRAM_BOT_NAME|机器人名字 xxx_bot|Environment Variables|顺序必须和`TELEGRAM_AVAILABLE_TOKENS` 一致, **必须设置否则无法在群聊中使用**|
|GROUP_CHAT_BOT_SHARE_MODE|群组机器人共享历史记录|Environment Variables|开启后，一个群组只有一个会话和配置。关闭的话群组的每个人都有自己的会话上下文。默认:`false`|
|CHAT_GROUP_WHITE_LIST|群组聊天ID白名单|Environment Variables|多个ID用`,`分隔，不知道ID，在群组中和机器人聊一句就能返回|

#### 用户配置
每个用户的自定义配置，只能通过Telegram发送消息来修改，消息格式为`/setenv KEY=VALUE`
|KEY|说明|例子|
|--|--|--|
|SYSTEM_INIT_MESSAGE|系统初始化参数，设定后就算开启新会话还能保持，不用每次都调试|/setenv SYSTEM_INIT_MESSAGE=现在开始是喵娘，每句话已喵结尾|
|OPENAI_API_EXTRA_PARAMS|OpenAI API额外参数，设定后每次调用API都会带上，可以用来调整温度等参数|/setenv OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}  每次修改必须为完整JSON|



## 部署流程
详情见 [部署流程](./DEPLOY.md)

## 自动更新
使用Github Action自动更新，详情见 [自动更新](./ACTION.md)

## 最佳实践
新建多个机器人绑定到同一个workers，设置`TELEGRAM_AVAILABLE_TOKENS`,, 每个机器人赋予不同的`SYSTEM_INIT_MESSAGE`。比如翻译专家，文案专家，代码专家。然后每次根据自己的需求和不同的机器人聊天，这样就不用经常切换配置属性。。


## 已知问题
- 群消息只能管理员调用bot
- 长消息被Telegram截断

## 更新日志
- v1.2.0
    - 修复高危漏洞，必须更新
    
- v1.1.0
    - 由单文件改为多文件，方便维护，提供dist目录，方便复制粘贴。
    - 删除新增部分配置，提供兼容性代码，方便升级。
    - 修改KV key生成逻辑，可能导致之前的数据丢失，可手动修改key或重新配置。
    - 修复部分bug
    - 自动绑定所有指令
    - BREAKING CHANGE： 重大改动，必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

- v1.0.0
    - 初始版本

## TODO LIST

- [x] 允许多个机器人同时绑定一个workers
