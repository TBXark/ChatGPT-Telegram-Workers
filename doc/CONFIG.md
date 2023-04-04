# 配置

推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

### KV配置
|KEY|特殊说明|
|--|--|
|DATABASE|先新建KV，新建的时候名字随意，然后绑定的时候必须设定为DATABASE|

### 系统配置
为每个用户通用的配置，通常在workers配置界面填写

|KEY|说明|默认值|特殊说明|
|--|--|--|--|
|API_KEY|OpenAI API Key|`null`||
|TELEGRAM_AVAILABLE_TOKENS|支持多个Telegram Bot Token|`null`|多个Token用`,`分隔|
|CHAT_WHITE_LIST|聊天ID白名单|`null`|多个ID用`,`分隔，不知道ID，和机器人聊一句就能返回|
|I_AM_A_GENEROUS_PERSON|关闭白名单，允许所有人访问|`false`|鉴于很多人不想设置白名单，或者不知道怎么获取ID，所以设置这个选项就能允许所有人访问， 值为`true`时生效|
|AUTO_TRIM_HISTORY|自动清理历史记录|`true`|为了避免4096字符限制，将消息删减|
|MAX_HISTORY_LENGTH|最大历史记录长度|`20`|`AUTO_TRIM_HISTORY开启后` 为了避免4096字符限制，将消息删减|
|CHAT_MODEL|open ai 模型选择 |`gpt-3.5-turbo`||
|SYSTEM_INIT_MESSAGE|系统初始化信息|`你是一个得力的助手`|默认机器人设定|
|SYSTEM_INIT_MESSAGE_ROLE|系统初始化信息角色|`system`|默认机器人设定|
|ENABLE_USAGE_STATISTICS|开启使用统计|`false`|开启后，每次调用API都会记录到KV，可以通过`/usage`查看|
|HIDE_COMMAND_BUTTONS|隐藏指令按钮|`null`|把想要隐藏的按钮写入用逗号分开`/start,/system`, 记得带上斜杠,修改之后得重新`init`|
|DEBUG_MODE|调试模式|`false`|目前可以把最新一条消息保存到KV方便调试,非常消耗KV写入量，正式环境务必关闭|
|LANGUAGE|语言|`zh-CN`|`zh-CN`，`zh-TW`和`en`|

### 群组配置
可以把机器人加到群组中，然后群组里的所有人都可以和机器人聊天。
> BREAKING CHANGE:
> 重大改动，必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

> IMPORTANT：受限TG的隐私安全策略，如果你的群组是公开群组或超过2000人，请将机器人设置为`管理员`，否则机器人无法响应`@机器人`的聊天消息。

> IMPORTANT：必须在botfather中设置`/setprivacy`为`Disable`，否则机器人无法响应`@机器人`的聊天消息。

|KEY|说明|默认值|特殊说明|
|--|--|--|--|
|GROUP_CHAT_BOT_ENABLE|开启群组机器人|`true`|开启后，机器人加入群组后，然后群组里的所有人都可以和机器人聊天。|
|TELEGRAM_BOT_NAME|机器人名字 xxx_bot|`null`|顺序必须和`TELEGRAM_AVAILABLE_TOKENS` 一致, **必须设置否则无法在群聊中使用**|
|GROUP_CHAT_BOT_SHARE_MODE|群组机器人共享历史记录|`false`|开启后，一个群组只有一个会话和配置。关闭的话群组的每个人都有自己的会话上下文。|
|CHAT_GROUP_WHITE_LIST|群组聊天ID白名单|`null`|多个ID用`,`分隔，不知道ID，在群组中和机器人聊一句就能返回|

### 用户配置
每个用户的自定义配置，只能通过Telegram发送消息来修改，消息格式为`/setenv KEY=VALUE`
|KEY|说明|例子|
|--|--|--|
|SYSTEM_INIT_MESSAGE|系统初始化参数，设定后就算开启新会话还能保持，不用每次都调试|`/setenv SYSTEM_INIT_MESSAGE=现在开始你是喵娘，每句话以喵结尾`|
|OPENAI_API_EXTRA_PARAMS|OpenAI API额外参数，设定后每次调用API都会带上，可以用来调整温度等参数|`/setenv OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}`  每次修改必须为完整JSON|
|OPENAI_API_KEY|OpenAI API Key，设定后每次调用API都会带上, 每个用户可以设定自己的Key|`/setenv OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`|




### 支持命令

| 命令 | 说明 | 示例 |
| :-- | :-- | :-- |
| `/help` | 获取命令帮助 | `/help` |
| `/new` | 发起新的对话 | `/new` |
| `/start` | 获取你的ID，并发起新的对话 | `/start` |
| `/img` | 生成一张图片| `/img 图片描述` |
| `/version` | 获取当前版本号，判断是否需要更新 | `/version` |
| `/setenv` | 设置用户配置, 详情见`用户配置` | `/setenv KEY=VALUE` |
| `/delenv` | 删除用户配置 | `/delenv KEY` |
| `/usage` | 获取当前机器人的用量统计 | `/usage` |
| `/system` | 查看当前一些系统信息 | `/system` |
| `/role` | 设置预设的身份, 配置使用方法同`/setenv` | `/role` |
| `/redo` | 修改上一个提问或者换一个回答 | `/redo 修改过的内容` 或者 `/redo` |
| `/echo` | 回显消息,仅开发模式可用 | `/echo` |

