# 配置

推荐在Workers配置界面填写环境变量， 而不是直接修改js代码中的变量

## KV配置

| KEY      | 特殊说明                                 |
|:---------|--------------------------------------|
| DATABASE | 先新建KV，新建的时候名字随意，然后绑定的时候必须设定为DATABASE |

## 系统配置

为每个用户通用的配置，只能在Workers配置界面或者toml中配置填写，不支持通过Telegram发送消息来修改。

> `array string`: 数组为空字符串，表示没有设置值，如果需要设置值，设置为`'value1,value2'`，多个值用逗号分隔。

### 基础配置

| KEY                       | 名称        | 默认值      | 描述              |
|---------------------------|-----------|----------|-----------------|
| LANGUAGE                  | 语言        | `zh-cn`  | 设置语言            |
| UPDATE_BRANCH             | 更新分支      | `master` | 检查更新的分支         |
| CHAT_COMPLETE_API_TIMEOUT | 聊天完成API超时 | `0`      | AI对话API的超时时间（秒） |

### Telegram配置

| KEY                       | 名称             | 默认值                         | 描述                                      |
|---------------------------|----------------|-----------------------------|-----------------------------------------|
| TELEGRAM_API_DOMAIN       | Telegram API域名 | `https://api.telegram.org/` | Telegram API的域名                         |
| TELEGRAM_AVAILABLE_TOKENS | 可用的Telegram令牌  | `''`(array string)          | 允许访问的Telegram Token，设置时以逗号分隔            |
| DEFAULT_PARSE_MODE        | 默认解析模式         | `Markdown`                  | 默认消息解析模式                                |
| I_AM_A_GENEROUS_PERSON    | 允许所有人使用        | `false`                     | 是否允许所有人使用                               |
| CHAT_WHITE_LIST           | 聊天白名单          | `''`(array string)          | 允许使用的聊天ID白名单                            |
| LOCK_USER_CONFIG_KEYS     | 锁定的用户配置键       | 默认值为所有API的URL               | 防止被替换导致token泄露的配置键                      |
| TELEGRAM_BOT_NAME         | Telegram机器人名称  | `''`(array string)          | 允许访问的Telegram Token对应的Bot Name，设置时以逗号分隔 |
| CHAT_GROUP_WHITE_LIST     | 群组白名单          | `''`(array string)          | 允许使用的群组ID白名单                            |
| GROUP_CHAT_BOT_ENABLE     | 群组机器人开关        | `true`                      | 是否启用群组机器人                               |
| GROUP_CHAT_BOT_SHARE_MODE | 群组机器人共享模式      | `true`                      | 开启后同个群组的人使用同一个聊天上下文                     |

> IMPORTANT: 必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

> IMPORTANT: 受限TG的隐私安全策略，如果你的群组是公开群组或超过2000人，请将机器人设置为`管理员`，否则机器人无法响应`@机器人`的聊天消息。

> IMPORTANT: 必须在botfather中设置`/setprivacy`为`Disable`，否则机器人无法响应`@机器人`的聊天消息。

#### 锁定配置 `LOCK_USER_CONFIG_KEYS`

> IMPORTANT: 如果你遇到`Key XXX is locked`的错误，说明你的配置被锁定了，需要解锁才能修改。

`LOCK_USER_CONFIG_KEYS`的默认值为所有API的BASE URL。为了防止用户替换API BASE URL导致token泄露，所以默认情况下会锁定所有API的BASE URL。如果你想解锁某个API的BASE URL，可以将其从`LOCK_USER_CONFIG_KEYS`中删除。
`LOCK_USER_CONFIG_KEYS`是一个字符串数组，默认值为：

```
OPENAI_API_BASE,GOOGLE_COMPLETIONS_API,MISTRAL_API_BASE,COHERE_API_BASE,ANTHROPIC_API_BASE,AZURE_COMPLETIONS_API,AZURE_DALLE_API
```

### 历史记录配置

| KEY                | 名称       | 默认值     | 描述                 |
|--------------------|----------|---------|--------------------|
| AUTO_TRIM_HISTORY  | 自动裁剪历史记录 | `true`  | 为避免4096字符限制，自动裁剪消息 |
| MAX_HISTORY_LENGTH | 最大历史记录长度 | `20`    | 保留的最大历史记录条数        |
| MAX_TOKEN_LENGTH   | 最大令牌长度   | `20480` | 历史记录的最大令牌长度        |

### 特性开关

| KEY                   | 名称       | 默认值                | 描述              |
|-----------------------|----------|--------------------|-----------------|
| HIDE_COMMAND_BUTTONS  | 隐藏命令按钮   | `''`(array string) | 修改后需要重新init     |
| SHOW_REPLY_BUTTON     | 显示快捷回复按钮 | `false`            | 是否显示快捷回复按钮      |
| EXTRA_MESSAGE_CONTEXT | 额外消息上下文  | `false`            | 引用的消息也会假如上下文    |
| STREAM_MODE           | 流模式      | `true`             | 打字机模式           |
| SAFE_MODE             | 安全模式     | `true`             | 开启后会保存最新一条消息的ID |
| DEBUG_MODE            | 调试模式     | `false`            | 开启后会保存最新一条消息    |
| DEV_MODE              | 开发模式     | `false`            | 开启后会展示更多调试信息    |

## 用户配置

每个用户的自定义配置，只能通过Telegram发送消息来修改，消息格式为`/setenv KEY=VALUE`, 用户配置的优先级比系统配置的更高。如果想删除配置，请使用`/delenv KEY`。 批量设置变量请使用`/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}`

### 通用配置

| KEY                          | 名称              | 默认值         | 描述                                                                     |
|------------------------------|-----------------|-------------|------------------------------------------------------------------------|
| AI_PROVIDER                  | AI提供商           | `auto`      | 可选值 `auto, openai, azure, workers, gemini, mistral, cohere, anthropic` |
| AI_IMAGE_PROVIDER            | AI图片提供商         | `auto`      | 可选值 `auto, openai, azure, workers`                                     |
| SYSTEM_INIT_MESSAGE          | 全局默认初始化消息       | `你是一个得力的助手` | 根据绑定的语言自动选择默认值                                                         |
| ~~SYSTEM_INIT_MESSAGE_ROLE~~ | ~~全局默认初始化消息角色~~ | `system`    | 废弃                                                                     |

### OpenAI

| KEY                     | 名称                      | 默认值                         |
|-------------------------|-------------------------|-----------------------------|
| OPENAI_API_KEY          | OpenAI API Key          | `''`(array string)          |
| OPENAI_CHAT_MODEL       | OpenAI的模型名称             | `gpt-4o-mini`               |
| OPENAI_API_BASE         | OpenAI API BASE         | `https://api.openai.com/v1` |
| OPENAI_API_EXTRA_PARAMS | OpenAI API Extra Params | `{}`                        |
| DALL_E_MODEL            | DALL-E的模型名称             | `dall-e-3`                  |
| DALL_E_IMAGE_SIZE       | DALL-E图片尺寸              | `512x512`                   |
| DALL_E_IMAGE_QUALITY    | DALL-E图片质量              | `standard`                  |
| DALL_E_IMAGE_STYLE      | DALL-E图片风格              | `vivid`                     |

### Azure OpenAI

> AZURE_COMPLETIONS_API `https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/chat/completions?api-version=VERSION_NAME`

> AZURE_DALLE_API `https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/images/generations?api-version=VERSION_NAME`

| KEY                       | 名称                        | 默认值          |
|---------------------------|---------------------------|--------------|
| AZURE_API_KEY             | Azure API Key             | `null`       |
| ~~AZURE_COMPLETIONS_API~~ | ~~Azure Completions API~~ | `null`       |
| ~~AZURE_DALLE_API~~       | ~~Azure DallE API~~       | `null`       |
| AZURE_RESOURCE_NAME       | Azure 资源名称                | `null`       |
| AZURE_CHAT_MODEL          | Azure 对话模型                | `null`       |
| AZURE_IMAGE_MODEL         | Azure 图片模型                | `null`       |
| AZURE_API_VERSION         | Azure API 版本号             | `2024-06-01` |


### Workers

| KEY                      | 名称                      | 默认值                                                        |
|--------------------------|-------------------------|------------------------------------------------------------|
| CLOUDFLARE_ACCOUNT_ID    | Cloudflare Account ID   | `null`                                                     |
| CLOUDFLARE_TOKEN         | Cloudflare Token        | `null`                                                     |
| WORKERS_CHAT_MODEL       | Text Generation Model   | `@cf/mistral/mistral-7b-instruct-v0.1 `                    |
| WORKERS_IMAGE_MODEL      | Text-to-Image Model     | `@cf/stabilityai/stable-diffusion-xl-base-1.0`             |

### Gemini

> cloudflare workers 暂时不支持访问

| KEY                        | 名称                               | 默认值                                                        |
|----------------------------|----------------------------------|------------------------------------------------------------|
| GOOGLE_API_KEY             | Google Gemini API Key            | `null`                                                     |
| ~~GOOGLE_COMPLETIONS_API~~ | ~~Google Gemini API~~            | `https://generativelanguage.googleapis.com/v1beta/models/` |
| GOOGLE_COMPLETIONS_MODEL   | Google Gemini Model              | `gemini-pro`                                               |
| GOOGLE_API_BASE            | 支持Openai API 格式的 Gemini API Base | `https://generativelanguage.googleapis.com/v1beta`         |

### Mistral

| KEY                      | 名称                      | 默认值                                                        |
|--------------------------|-------------------------|------------------------------------------------------------|
| MISTRAL_API_KEY          | Mistral API Key         | `null`                                                     |
| MISTRAL_API_BASE         | Mistral API Base        | `https://api.mistral.ai/v1`                                |
| MISTRAL_CHAT_MODEL       | Mistral API Model       | `mistral-tiny`                                             |

### Cohere

| KEY                      | 名称                      | 默认值                                                        |
|--------------------------|-------------------------|------------------------------------------------------------|
| COHERE_API_KEY           | Cohere API Key          | `null`                                                     |
| COHERE_API_BASE          | Cohere API Base         | `https://api.cohere.com/v1`                                |
| COHERE_CHAT_MODEL        | Cohere API Model        | `command-r-plus`                                           |

### Anthropic

| KEY                      | 名称                      | 默认值                                                        |
|--------------------------|-------------------------|------------------------------------------------------------|
| ANTHROPIC_API_KEY        | Anthropic API Key       | `null`                                                     |
| ANTHROPIC_API_BASE       | Anthropic API Base      | `https://api.anthropic.com/v1`                             |
| ANTHROPIC_CHAT_MODEL     | Anthropic API Model     | `claude-3-haiku-20240307`                                  |

## 支持命令

| 命令         | 说明                  | 示例                                              |
|:-----------|:--------------------|:------------------------------------------------|
| `/help`    | 获取命令帮助              | `/help`                                         |
| `/new`     | 发起新的对话              | `/new`                                          |
| `/start`   | 获取你的ID，并发起新的对话      | `/start`                                        |
| `/img`     | 生成一张图片              | `/img 图片描述`                                     |
| `/version` | 获取当前版本号，判断是否需要更新    | `/version`                                      |
| `/setenv`  | 设置用户配置, 详情见`用户配置`   | `/setenv KEY=VALUE`                             |
| `/setenvs` | 批量设置用户配置, 详情见`用户配置` | `/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}` |
| `/delenv`  | 删除用户配置              | `/delenv KEY`                                   |
| `/system`  | 查看当前一些系统信息          | `/system`                                       |
| `/redo`    | 修改上一个提问或者换一个回答      | `/redo 修改过的内容` 或者 `/redo`                       |
| `/models`  | 切换对话模型              | `/models` 后通过内置菜单选择模型                           |
| `/echo`    | 回显消息,仅开发模式可用        | `/echo`                                         |

## 自定义命令

除了上述系统定义的指令，你也可以自定义快捷指令， 可以将某些较长的指令简化为一个单词的指令。

自定义指令使用环境变量设置 `CUSTOM_COMMAND_XXX`，其中XXX为指令名，比如`CUSTOM_COMMAND_azure`，值为指令内容，比如`/setenvs {"AI_PROVIDER": "azure"}`。 这样就可以使用`/azure`来代替`/setenvs {"AI_PROVIDER": "azure"}`实现快速切换AI提供商。

下面是一些自定义指令例子

| 指令                     | 值                                                                          |
|------------------------|----------------------------------------------------------------------------|
| CUSTOM_COMMAND_azure   | `/setenvs {"AI_PROVIDER": "azure"}`                                        |
| CUSTOM_COMMAND_workers | `/setenvs {"AI_PROVIDER": "workers"}`                                      |
| CUSTOM_COMMAND_gpt3    | `/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-3.5-turbo"}` |
| CUSTOM_COMMAND_gpt4    | `/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-4"}`         |
| CUSTOM_COMMAND_cn2en   | `/setenvs {"SYSTEM_INIT_MESSAGE": "你是一个翻译下面将我说的话都翻译成英文"}`                  |

如果你是用toml进行配置，可以使用下面的方式：

```toml
CUSTOM_COMMAND_azure= '/setenvs {"AI_PROVIDER": "azure"}'
CUSTOM_COMMAND_workers = '/setenvs {"AI_PROVIDER": "workers"}'
CUSTOM_COMMAND_gpt3 = '/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-3.5-turbo"}'
CUSTOM_COMMAND_gpt4 = '/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-4"}'
CUSTOM_COMMAND_cn2en = '/setenvs {"SYSTEM_INIT_MESSAGE": "你是一个翻译下面将我说的话都翻译成英文"}'
```

## 自定义指令帮助信息

如果你想为自定义指令添加帮助信息，可以使用环境变量设置 `COMMAND_DESCRIPTION_XXX`，其中`XXX`为指令名，比如`COMMAND_DESCRIPTION_azure`，值为指令描述，比如`切换AI提供商为Azure`。 这样就可以使用`/help`查看到自定义指令的帮助信息。

下面是一些自定义指令帮助信息例子

| 指令描述                        | 描述                           |
|-----------------------------|------------------------------|
| COMMAND_DESCRIPTION_azure   | 切换AI提供商为Azure                |
| COMMAND_DESCRIPTION_workers | 切换AI提供商为Workers              |
| COMMAND_DESCRIPTION_gpt3    | 切换AI提供商为OpenAI GPT-3.5 Turbo | 
| COMMAND_DESCRIPTION_gpt4    | 切换AI提供商为OpenAI GPT-4         | 
| COMMAND_DESCRIPTION_cn2en   | 将对话内容翻译成英文                   |

如果你是用toml进行配置，可以使用下面的方式：

```toml
COMMAND_DESCRIPTION_azure = '切换AI提供商为Azure'
COMMAND_DESCRIPTION_workers = '切换AI提供商为Workers'
COMMAND_DESCRIPTION_gpt3 = '切换AI提供商为OpenAI GPT-3.5 Turbo'
COMMAND_DESCRIPTION_gpt4 = '切换AI提供商为OpenAI GPT-4'
COMMAND_DESCRIPTION_cn2en = '将对话内容翻译成英文'
```

如果你想将自定义命令绑定到telegram的菜单中，你可以添加如下环境变量`COMMAND_SCOPE_azure = "all_private_chats,all_group_chats,all_chat_administrators"`，这样插件就会在所有的私聊，群聊和群组中生效。


## 模型列表

支持使用 `/models` 命令获取支持的模型列表，并且通过菜单选择切换。
模型列表支持的配置项的类型为 URL 或者 json 数组。 如果是 URL，会自动请求获取模型列表，如果是 json 数组，会直接使用该数组。
当前支持从URL获取模型列表的AI提供商有 `openai, workers, mistral, cohere`。只支持 json 数组的AI提供商有 `azure, gemini, anthropic`。
当支持从URL获取模型列表的AI提供商的模型列表配置项为空时候，会默认根据其 base api 自动拼接获取模型列表的URL。

| AI提供商     | 模型列表配置项                        | 默认值                                                       | 自动拼接生成的值                                                                                                         |
|:----------|--------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| openai    | OPENAI_CHAT_MODELS_LIST        | ``                                                        | `${OPENAI_API_BASE}/models`                                                                                      |
| workers   | WORKERS_CHAT_MODELS_LIST       | ``                                                        | `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/models/search?task=Text%20Generation` |
| mistral   | MISTRAL_CHAT_MODELS_LIST       | ``                                                        | `${MISTRAL_API_BASE}/models`                                                                                     |
| cohere    | COHERE_CHAT_MODELS_LIST        | ``                                                        | `https://api.cohere.com/v1/models`                                                                               |
| azure     | AZURE_CHAT_MODELS_LIST         | `[]`                                                      |                                                                                                                  |
| gemini    | GOOGLE_COMPLETIONS_MODELS_LIST | `["gemini-1.5-flash"]`                                    |                                                                                                                  |
| anthropic | ANTHROPIC_CHAT_MODELS_LIST     | `["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"]` |                                                                                                                  |
