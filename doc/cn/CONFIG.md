# 配置

推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

### KV配置

| KEY      | 特殊说明                                 |
|:---------|--------------------------------------|
| DATABASE | 先新建KV，新建的时候名字随意，然后绑定的时候必须设定为DATABASE |



### 系统配置

为每个用户通用的配置，通常在workers配置界面填写

| KEY                       | 说明                                         | 默认值                                                                 | 特殊说明                                                                                                                            |
|:--------------------------|--------------------------------------------|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| LANGUAGE                  | 语言                                         | `zh-CN`                                                             | `zh-CN`，`zh-TW`和`en`                                                                                                            |
| AI_PROVIDER               | AI提供商                                      | `auto`                                                              | AI提供商: auto, azure, openai, workers; auto为自动选择一个有效的配置，判断优先级为 azure > openai > workers                                           |
| UPDATE_BRANCH             | 分支                                         | `master`                                                            | 版本检测所在分支                                                                                                                        |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| TELEGRAM_API_DOMAIN       | Telegram                                   | `https://api.telegram.org`                                          | 可以自定义Telegram服务器                                                                                                                |
| TELEGRAM_AVAILABLE_TOKENS | 支持多个Telegram Bot Token                     | `null`                                                              | 多个Token用`,`分隔                                                                                                                   |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| CHAT_WHITE_LIST           | 聊天ID白名单                                    | `null`                                                              | 多个ID用`,`分隔，不知道ID，和机器人聊一句就能返回                                                                                                    |
| I_AM_A_GENEROUS_PERSON    | 关闭白名单，允许所有人访问                              | `false`                                                             | 鉴于很多人不想设置白名单，或者不知道怎么获取ID，所以设置这个选项就能允许所有人访问， 值为`true`时生效                                                                         |
| LOCK_USER_CONFIG_KEYS     | 锁定自定义用户配置                                  | `[]`                                                                | 可以锁定某些字段。比如设置为`CHAT_MODEL`就可以防止其他用户通过`/setenv`指令切换模型，多个字段用`,`分隔                                                                 |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| AUTO_TRIM_HISTORY         | 自动清理历史记录                                   | `true`                                                              | 为了避免4096字符限制，将消息删减                                                                                                              |
| MAX_HISTORY_LENGTH        | 最大历史记录长度                                   | `20`                                                                | `AUTO_TRIM_HISTORY开启后` 为了避免4096字符限制，将消息删减                                                                                       |
| MAX_TOKEN_LENGTH          | 最大历史token数量                                | 2048                                                                | 过长容易超时建议设定在一个合适的数字                                                                                                              |
| GPT3_TOKENS_COUNT         | GTP计数模式                                    | `false`                                                             | 使用更加精准的token计数模式替代单纯判断字符串长度，但是容易超时                                                                                              |
| GPT3_TOKENS_COUNT_REPO    | GPT3计数器资源所在Repo                            | `https://raw.githubusercontent.com/tbxark-arc/GPT-3-Encoder/master` | 加载 GPT3 Token 计数配置的资源文件                                                                                                         |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| SYSTEM_INIT_MESSAGE       | 系统初始化信息                                    | `你是一个得力的助手`                                                         | 默认机器人设定                                                                                                                         |
| SYSTEM_INIT_MESSAGE_ROLE  | 系统初始化信息角色                                  | `system`                                                            | 默认机器人设定                                                                                                                         |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| ENABLE_USAGE_STATISTICS   | 开启使用统计                                     | `false`                                                             | 开启后，每次调用API都会记录到KV，可以通过`/usage`查看                                                                                               |
| HIDE_COMMAND_BUTTONS      | 隐藏指令按钮                                     | `null`                                                              | 把想要隐藏的按钮写入用逗号分开`/start,/system`, 记得带上斜杠,修改之后得重新`init`                                                                           |
| SHOW_REPLY_BUTTON         | 显示快捷回复按钮                                   | `false`                                                             | 显示快捷回复按钮                                                                                                                        |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| DEBUG_MODE                | 调试模式                                       | `false`                                                             | 目前可以把最新一条消息保存到KV方便调试,非常消耗KV写入量，正式环境务必关闭                                                                                         |
| DEV_MODE                  | 开发模式                                       | `false`                                                             | 开发测试用                                                                                                                           |
| STREAM_MODE               | 流模式                                        | `true`                                                              | 得到类似ChatGPT Web一样的打字机输出模式                                                                                                       |
| SAFE_MODE                 | 安全模式                                       | `true`                                                              | 安全模式，会增加KV写损耗，但是能避免Workers超时导致的Telegram死亡循环重试，减少Token的浪费，不建议关闭。                                                                 |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| API_KEY                   | OpenAI API Key                             | `null`                                                              | 可以同时使用多个key，使用的时候会随机选择一个                                                                                                        |
| CHAT_MODEL                | open ai 模型选择                               | `gpt-3.5-turbo`                                                     |                                                                                                                                 |
| OPENAI_API_DOMAIN         | OPENAI API Domain [废弃: 使用 OPENAI_API_BASE] | `https://api.openai.com`                                            | 可以替换为其他与OpenAI API兼容的其他服务商的域名                                                                                                   |
| OPENAI_API_BASE           | OPENAI API Base URL                        | `https://api.openai.com/v1`                                         | 兼容Cloudflare AI 网关                                                                                                              |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| AZURE_API_KEY             | azure api key                              | `null`                                                              | 支持azure的API，两个密钥随便选一个就可以。如果你要默认使用azure，你可以设置`AI_PROVIDER`为`azure`                                                               |
| AZURE_COMPLETIONS_API     | azure api url                              | `null`                                                              | 格式`https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2023-05-15` |
| AZURE_DALLE_API           | azure dalle api url                        | `null`                                                              | 格式`https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2023-12-01-preview`   |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| CLOUDFLARE_ACCOUNT_ID     | Cloudflare 的 用户ID                          | `null`                                                              | 你可以在workers首页的右侧信息栏中找到这个信息。如果你要默认使用workers ai，你可以设置`AI_PROVIDER`为`workers`                                                      |
| CLOUDFLARE_TOKEN          | Cloudflare的Token                           | `null`                                                              | 你可以在`https://dash.cloudflare.com/profile/api-tokens`中使用`Workers AI (Beta)`模板创建                                                  |
| WORKERS_CHAT_MODEL        | 文字生成模型                                     | `@cf/meta/llama-2-7b-chat-fp16`                                     | 具体模型列表可以查看`https://developers.cloudflare.com/workers-ai/models/llm/`                                                            |
| WORKERS_IMAGE_MODEL       | 文字生成图片模型                                   | `@cf/stabilityai/stable-diffusion-xl-base-1.0`                      | 同上                                                                                                                              |
| -                         | -                                          | -                                                                   | -                                                                                                                               |
| DALL_E_MODEL              | 生成图像的模型                                    | `dall-e-2`                                                          | 支持 `dall-e-2` 和 `dall-e-3`                                                                                                      |
| DALL_E_IMAGE_SIZE         | 生成图像的尺寸                                    | `512x512`                                                           | 生成图像的尺寸。对于 dall-e-2，必须是256x256、512x512或1024x1024之一。对于 dall-e-3 模型，必须是1024x1024、1792x1024或1024x1792之一。                           |
| DALL_E_IMAGE_QUALITY      | 生成图像的质量                                    | `standard`                                                          | 将要生成的图片质量。hd会创建具有更精细细节和整体一致性的图片。此参数仅支持dall-e-3.                                                                                 |
| DALL_E_IMAGE_STYLE        | 生成图像的风格                                    | `vivid`                                                             | 生成图像的风格。必须是 vivid 或 natural 中的一个。vivid使模型倾向于产生超现实和戏剧化的图片。natural使模型产生更自然、不那么超现实外观的图片。此参数仅支持dall-e-3.                            |



### 群组配置

可以把机器人加到群组中，然后群组里的所有人都可以和机器人聊天。
> BREAKING CHANGE:
> 重大改动，必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

> IMPORTANT：受限TG的隐私安全策略，如果你的群组是公开群组或超过2000人，请将机器人设置为`管理员`，否则机器人无法响应`@机器人`的聊天消息。

> IMPORTANT：必须在botfather中设置`/setprivacy`为`Disable`，否则机器人无法响应`@机器人`的聊天消息。

| KEY                       | 说明            | 默认值     | 特殊说明                                                    |
|:--------------------------|---------------|---------|---------------------------------------------------------|
| GROUP_CHAT_BOT_ENABLE     | 开启群组机器人       | `true`  | 开启后，机器人加入群组后，然后群组里的所有人都可以和机器人聊天。                        |
| TELEGRAM_BOT_NAME         | 机器人名字 xxx_bot | `null`  | 顺序必须和`TELEGRAM_AVAILABLE_TOKENS` 一致, **必须设置否则无法在群聊中使用** |
| GROUP_CHAT_BOT_SHARE_MODE | 群组机器人共享历史记录   | `false` | 开启后，一个群组只有一个会话和配置。关闭的话群组的每个人都有自己的会话上下文。                 |
| CHAT_GROUP_WHITE_LIST     | 群组聊天ID白名单     | `null`  | 多个ID用`,`分隔，不知道ID，在群组中和机器人聊一句就能返回                        |



### 用户配置

每个用户的自定义配置，只能通过Telegram发送消息来修改，消息格式为`/setenv KEY=VALUE`, 用户配置的优先级比系统配置的更高。如果想删除配置，请使用`/delenv KEY`。 批量设置变量请使用`/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}`

| KEY                      | 说明                                                                                                               |
|:-------------------------|:-----------------------------------------------------------------------------------------------------------------|
| AI_PROVIDER              | 配置与  `ENV.AI_PROVIDER` 相同                                                                                        |
| CHAT_MODEL               | 配置与  `ENV.CHAT_MODEL` 相同                                                                                         |
| OPENAI_API_KEY           | 设置该值之后将不会调用系统配置的KEY                                                                                              |
| OPENAI_API_EXTRA_PARAMS  | OpenAI API额外参数，设定后每次调用API都会带上，可以用来调整温度等参数， `/setenv OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}`  每次修改必须为完整JSON |
| SYSTEM_INIT_MESSAGE      | 配置与  `ENV.SYSTEM_INIT_MESSAGE` 相同                                                                                |
| DALL_E_MODEL             | 配置与  `ENV.DALL_E_MODEL` 相同                                                                                       |
| DALL_E_IMAGE_SIZE        | 配置与  `ENV.DALL_E_IMAGE_SIZE` 相同                                                                                  |
| DALL_E_IMAGE_QUALITY     | 配置与  `ENV.DALL_E_IMAGE_QUALITY` 相同                                                                               |
| DALL_E_IMAGE_STYLE       | 配置与  `ENV.DALL_E_IMAGE_STYLE` 相同                                                                                 |
| AZURE_API_KEY            | 配置与  `ENV.AZURE_API_KEY` 相同                                                                                      |
| AZURE_COMPLETIONS_API    | 配置与  `ENV.AZURE_COMPLETIONS_API` 相同                                                                              |
| AZURE_DALLE_API          | 配置与  `ENV.AZURE_DALLE_API` 相同                                                                                    |
| WORKERS_CHAT_MODEL       | 配置与  `ENV.WORKERS_CHAT_MODEL` 相同                                                                                 |
| WORKER_IMAGE_MODEL       | 配置与  `ENV.WORKER_IMAGE_MODEL` 相同                                                                                 |
| GOOGLE_API_KEY           | 配置与  `ENV.GOOGLE_API_KEY` 相同                                                                                     |
| GOOGLE_COMPLETIONS_API   | 配置与  `ENV.GOOGLE_COMPLETIONS_API` 相同                                                                             |
| GOOGLE_COMPLETIONS_MODEL | 配置与  `ENV.GOOGLE_COMPLETIONS_MODEL` 相同                                                                           |


### 支持命令

| 命令         | 说明                        | 示例                                              |
|:-----------|:--------------------------|:------------------------------------------------|
| `/help`    | 获取命令帮助                    | `/help`                                         |
| `/new`     | 发起新的对话                    | `/new`                                          |
| `/start`   | 获取你的ID，并发起新的对话            | `/start`                                        |
| `/img`     | 生成一张图片                    | `/img 图片描述`                                     |
| `/version` | 获取当前版本号，判断是否需要更新          | `/version`                                      |
| `/setenv`  | 设置用户配置, 详情见`用户配置`         | `/setenv KEY=VALUE`                             |
| `/setenvs` | 批量设置用户配置, 详情见`用户配置`       | `/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}` |
| `/delenv`  | 删除用户配置                    | `/delenv KEY`                                   |
| `/usage`   | 获取当前机器人的用量统计              | `/usage`                                        |
| `/system`  | 查看当前一些系统信息                | `/system`                                       |
| `/role`    | 设置预设的身份, 配置使用方法同`/setenv` | `/role`                                         |
| `/redo`    | 修改上一个提问或者换一个回答            | `/redo 修改过的内容` 或者 `/redo`                       |
| `/echo`    | 回显消息,仅开发模式可用              | `/echo`                                         |



### 自定义命令

除了上述系统定义的指令，你也可以自定义快捷指令， 可以将某些较长的指令简化为一个单词的指令。

自定义指令使用环境变量设置 CUSTOM_COMMAND_XXX，其中XXX为指令名，比如`CUSTOM_COMMAND_azure`，值为指令内容，比如`/setenvs {"AI_PROVIDER": "azure"}`。 这样就可以使用`/azure`来代替`/setenvs {"AI_PROVIDER": "azure"}`实现快速切换AI提供商。

下面是一些自定义指令例子

| 指令                     | 值                                                                   |
|------------------------|---------------------------------------------------------------------|
| CUSTOM_COMMAND_azure   | `/setenvs {"AI_PROVIDER": "azure"}`                                 |
| CUSTOM_COMMAND_workers | `/setenvs {"AI_PROVIDER": "workers"}`                               |
| CUSTOM_COMMAND_gpt3    | `/setenvs {"AI_PROVIDER": "openai", "CHAT_MODEL": "gpt-3.5-turbo"}` |
| CUSTOM_COMMAND_gpt4    | `/setenvs {"AI_PROVIDER": "openai", "CHAT_MODEL": "gpt-4"}`         |


如果你是用toml进行配置，可以使用下面的方式：

```toml
CUSTOM_COMMAND_azure= '/setenvs {"AI_PROVIDER": "azure"}'
CUSTOM_COMMAND_workers = '/setenvs {"AI_PROVIDER": "workers"}'
CUSTOM_COMMAND_gpt3 = '/setenvs {"AI_PROVIDER": "openai", "CHAT_MODEL": "gpt-3.5-turbo"}'
CUSTOM_COMMAND_gpt4 = '/setenvs {"AI_PROVIDER": "openai", "CHAT_MODEL": "gpt-4"}'
```

