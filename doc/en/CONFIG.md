# Configuration

It is recommended to fill in environment variables in the Workers configuration interface instead of directly modifying variables in the JS code.

## KV configuration

| KEY      | Description                                                                                                       |
|:---------|-------------------------------------------------------------------------------------------------------------------|
| DATABASE | First, create a KV. When creating it, the name can be arbitrary, but when binding it, it must be set as DATABASE. |

## System Configuration

The configuration that is common to each user can only be configured and filled in through the Workers configuration interface or toml, and it is not supported to modify it by sending messages through Telegram.

> `array string`:  An empty string in the array indicates that no value has been set. If a value needs to be set, it should be set as `'value1,value2'`, with multiple values separated by commas.

### Basic configuration

| KEY                       | Name                      | Default  | Description                               |
|---------------------------|---------------------------|----------|-------------------------------------------|
| LANGUAGE                  | Language                  | `zh-cn`  | Menu language                             |
| UPDATE_BRANCH             | Update branch             | `master` | Check the branch for updates              |
| CHAT_COMPLETE_API_TIMEOUT | Chat complete API timeout | `0`      | Timeout for AI conversation API (seconds) |

### Telegram configuration

| KEY                       | Name                           | Default                                    | Description                                                                                                   |
|---------------------------|--------------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| TELEGRAM_API_DOMAIN       | Telegram API Domain            | `https://api.telegram.org/`                | Telegram API domain                                                                                           |
| TELEGRAM_AVAILABLE_TOKENS | Available Telegram tokens.     | `''`(array string)                         | Telegram Tokens allowed to access, separated by commas when setting.                                          |
| DEFAULT_PARSE_MODE        | Default parsing mode.          | `Markdown`                                 | Default message parsing mode.                                                                                 |
| I_AM_A_GENEROUS_PERSON    | Allow everyone to use.         | `false`                                    | Is it allowed for everyone to use?                                                                            |
| CHAT_WHITE_LIST           | Chat whitelist                 | `''`(array string)                         | Allowed Chat ID Whitelist                                                                                     |
| LOCK_USER_CONFIG_KEYS     | Locked user configuration key. | The default value is the URL for all APIs. | Configuration key to prevent token leakage caused by replacement.                                             |
| TELEGRAM_BOT_NAME         | Telegram bot name              | `''`(array string)                         | The Bot Name corresponding to the Telegram Token that is allowed to access, separated by commas when setting. |
| CHAT_GROUP_WHITE_LIST     | Group whitelist                | `''`(array string)                         | Allowed group ID whitelist.                                                                                   |
| GROUP_CHAT_BOT_ENABLE     | Whether to enable group bots.  | `true`                                     | Whether to enable group robots.                                                                               |
| GROUP_CHAT_BOT_SHARE_MODE | Group robot sharing mode       | `true`                                     | After opening, people in the same group use the same chat context.                                            |

> IMPORTANT: You must add the group ID to the whitelist `CHAT_GROUP_WHITE_LIST` to use it, otherwise anyone can add your bot to the group and consume your quota.

> IMPORTANT: Due to Telegram's privacy and security policies, if your group is a public group or has more than 2000 members, please set the bot as an `administrator`, otherwise the bot will not respond to chat messages with `@bot`.

> IMPORTANT: You must set `/setprivacy` to `Disable` in botfather, otherwise the bot will not respond to chat messages with `@bot`.

#### Lock configuration `LOCK_USER_CONFIG_KEYS`

> IMPORTANT: If you encounter the error "Key XXX is locked", it means that your configuration is locked and needs to be unlocked before modification.

The default value of `LOCK_USER_CONFIG_KEYS` is the BASE URL of all APIs. In order to prevent users from replacing the API BASE URL and causing token leakage, the BASE URL of all APIs is locked by default. If you want to unlock the BASE URL of a certain API, you can remove it from `LOCK_USER_CONFIG_KEYS`.
`LOCK_USER_CONFIG_KEYS` is a string array with a default value is 

```
OPENAI_API_BASE,GOOGLE_COMPLETIONS_API,MISTRAL_API_BASE,COHERE_API_BASE,ANTHROPIC_API_BASE,AZURE_COMPLETIONS_API,AZURE_DALLE_API
```

### History configuration

| KEY                | Name                                  | Default | Description                                                   |
|--------------------|---------------------------------------|---------|---------------------------------------------------------------|
| AUTO_TRIM_HISTORY  | Automatic trimming of message history | `true`  | Automatically trim messages to avoid the 4096 character limit |
| MAX_HISTORY_LENGTH | Maximum length of message history     | `20`    | Maximum number of message history entries to keep             |
| MAX_TOKEN_LENGTH   | Maximum token length                  | `20480` | Maximum token length for message history                      |

### Feature configuration

| KEY                   | Name                    | Default            | Description                                                 |
|-----------------------|-------------------------|--------------------|-------------------------------------------------------------|
| HIDE_COMMAND_BUTTONS  | Hide command buttons    | `''`(array string) | Need to re-initiate after modification                      |
| SHOW_REPLY_BUTTON     | Show quick reply button | `false`            | Whether to display the quick reply button                   |
| EXTRA_MESSAGE_CONTEXT | Extra message context   | `false`            | The referenced message will also be included in the context |
| STREAM_MODE           | Stream mode             | `true`             | Typewriter mode                                             |
| SAFE_MODE             | Safe mode               | `true`             | When enabled, the ID of the latest message will be saved    |
| DEBUG_MODE            | Debug mode              | `false`            | When enabled, the latest message will be saved              |
| DEV_MODE              | Development mode        | `false`            | When enabled, more debugging information will be displayed  |

## User configuration

Each user's custom configuration can only be modified by sending a message through Telegram. The message format is `/setenv KEY=VALUE`. User configurations have a higher priority than system configurations. If you want to delete a configuration, please use `/delenv KEY`. To set variables in batches, please use `/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}`.

### General configuration

| KEY                          | Name                                     | Default                       | Description                                                                |
|------------------------------|------------------------------------------|-------------------------------|----------------------------------------------------------------------------|
| AI_PROVIDER                  | AI provider                              | `auto`                        | Options `auto, openai, azure, workers, gemini, mistral, cohere, anthropic` |
| AI_IMAGE_PROVIDER            | AI image provider                        | `auto`                        | Options `auto, openai, azure, workers`                                     |
| SYSTEM_INIT_MESSAGE          | Default initialization message.          | `You are a helpful assistant` | Automatically select default values based on the bound language.           |
| ~~SYSTEM_INIT_MESSAGE_ROLE~~ | ~~Default initialization message role.~~ | `system`                      | Deprecated                                                                 |

### OpenAI

| KEY                     | Name                    | Default                     | 
|-------------------------|-------------------------|-----------------------------|
| OPENAI_API_KEY          | OpenAI API Key          | `''`(array string)          |
| OPENAI_CHAT_MODEL       | OpenAI Model            | `gpt-4o-mini`               |
| OPENAI_API_BASE         | OpenAI API BASE         | `https://api.openai.com/v1` |
| OPENAI_API_EXTRA_PARAMS | OpenAI API Extra Params | `{}`                        |
| DALL_E_MODEL            | DALL-E model name.      | `dall-e-3`                  |
| DALL_E_IMAGE_SIZE       | DALL-E Image size       | `512x512`                   |
| DALL_E_IMAGE_QUALITY    | DALL-E Image quality    | `standard`                  |
| DALL_E_IMAGE_STYLE      | DALL-E Image style      | `vivid`                     |

### Azure OpenAI

> AZURE_COMPLETIONS_API `https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/chat/completions?api-version=VERSION_NAME`

> AZURE_DALLE_API `https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/images/generations?api-version=VERSION_NAME`

| KEY                       | 名称                        | 默认值          |
|---------------------------|---------------------------|--------------|
| AZURE_API_KEY             | Azure API Key             | `null`       |
| ~~AZURE_COMPLETIONS_API~~ | ~~Azure Completions API~~ | `null`       |
| ~~AZURE_DALLE_API~~       | ~~Azure DallE API~~       | `null`       |
| AZURE_RESOURCE_NAME       | Azure Resource Name       | `null`       |
| AZURE_CHAT_MODEL          | Azure Chat Model          | `null`       |
| AZURE_IMAGE_MODEL         | Azure Image Model         | `null`       |
| AZURE_API_VERSION         | Azure API version number  | `2024-06-01` |


### Workers

| KEY                   | Name                  | Default                                        | 
|-----------------------|-----------------------|------------------------------------------------|
| CLOUDFLARE_ACCOUNT_ID | Cloudflare Account ID | `null`                                         |
| CLOUDFLARE_TOKEN      | Cloudflare Token      | `null`                                         |
| WORKERS_CHAT_MODEL    | Text Generation Model | `@cf/mistral/mistral-7b-instruct-v0.1 `        |
| WORKERS_IMAGE_MODEL   | Text-to-Image Model   | `@cf/stabilityai/stable-diffusion-xl-base-1.0` |

### Gemini

> Cloudflare Workers currently do not support accessing Gemini.

| KEY                        | Name                                          | Default                                                    | 
|----------------------------|-----------------------------------------------|------------------------------------------------------------|
| GOOGLE_API_KEY             | Google Gemini API Key                         | `null`                                                     |
| ~~GOOGLE_COMPLETIONS_API~~ | ~~Google Gemini API~~                         | `https://generativelanguage.googleapis.com/v1beta/models/` |
| GOOGLE_COMPLETIONS_MODEL   | Google Gemini Model                           | `gemini-pro`                                               |
| GOOGLE_API_BASE            | Supports Gemini API Base in OpenAI API format | `https://generativelanguage.googleapis.com/v1beta`         |



### Mistral

| KEY                | Name              | Default                     | 
|--------------------|-------------------|-----------------------------|
| MISTRAL_API_KEY    | Mistral API Key   | `null`                      |
| MISTRAL_API_BASE   | Mistral API Base  | `https://api.mistral.ai/v1` |
| MISTRAL_CHAT_MODEL | Mistral API Model | `mistral-tiny`              |

### Cohere

| KEY               | Name             | Default                     | 
|-------------------|------------------|-----------------------------|
| COHERE_API_KEY    | Cohere API Key   | `null`                      |
| COHERE_API_BASE   | Cohere API Base  | `https://api.cohere.com/v1` |
| COHERE_CHAT_MODEL | Cohere API Model | `command-r-plus`            |

### Anthropic

| KEY                  | Name                | Default                        | 
|----------------------|---------------------|--------------------------------|
| ANTHROPIC_API_KEY    | Anthropic API Key   | `null`                         |
| ANTHROPIC_API_BASE   | Anthropic API Base  | `https://api.anthropic.com/v1` |
| ANTHROPIC_CHAT_MODEL | Anthropic API Model | `claude-3-haiku-20240307`      |

## Command

| Command    | Description                                                             | Example                                                           |
|:-----------|:------------------------------------------------------------------------|:------------------------------------------------------------------|
| `/help`    | Get command help.                                                       | `/help`                                                           |
| `/new`     | Initiate a new conversation.                                            | `/new`                                                            |
| `/start`   | Get your ID and start a new conversation.                               | `/start`                                                          |
| `/img`     | Generate an image.                                                      | `/img Image Description`                                          |
| `/version` | Get the current version number and determine if an update is needed.    | `/version`                                                        |
| `/setenv`  | Set user configuration, see `User Configuration` for details.           | `/setenv KEY=VALUE`                                               |
| `/setenvs` | Batch setting user configuration, see "User Configuration" for details. | `/setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}`                   |
| `/delenv`  | Delete user configuration.                                              | `/delenv KEY`                                                     |
| `/system`  | View some current system information.                                   | `/system`                                                         |
| `/redo`    | Edit the previous question or provide a different answer.               | `/redo Modified content.` or `/redo`                              |
| `/models`  | Switch chat model                                                       | `/models` After that, select the model through the built-in menu. |
| `/echo`    | Echo message, only available in development mode.                       | `/echo`                                                           |

## Custom command

In addition to the commands defined by the system, you can also customize shortcut commands, which can simplify some longer commands into a single word command.

Custom commands use environment variables to set `CUSTOM_COMMAND_XXX`, where XXX is the command name, such as `CUSTOM_COMMAND_azure`, and the value is the command content, such as `/setenvs {"AI_PROVIDER": "azure"}`. This allows you to use `/azure` instead of `/setenvs {"AI_PROVIDER": "azure"}` to quickly switch AI providers.

Here are some examples of custom commands.

| Command                | Value                                                                                                             |
|------------------------|-------------------------------------------------------------------------------------------------------------------|
| CUSTOM_COMMAND_azure   | `/setenvs {"AI_PROVIDER": "azure"}`                                                                               |
| CUSTOM_COMMAND_workers | `/setenvs {"AI_PROVIDER": "workers"}`                                                                             |
| CUSTOM_COMMAND_gpt3    | `/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-3.5-turbo"}`                                        |
| CUSTOM_COMMAND_gpt4    | `/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-4"}`                                                |
| CUSTOM_COMMAND_cn2en   | `/setenvs {"SYSTEM_INIT_MESSAGE": "You are a translator. Please translate everything I say below into English."}` |

If you are using TOML for configuration, you can use the following method:

```toml
CUSTOM_COMMAND_azure= '/setenvs {"AI_PROVIDER": "azure"}'
CUSTOM_COMMAND_workers = '/setenvs {"AI_PROVIDER": "workers"}'
CUSTOM_COMMAND_gpt3 = '/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-3.5-turbo"}'
CUSTOM_COMMAND_gpt4 = '/setenvs {"AI_PROVIDER": "openai", "OPENAI_CHAT_MODEL": "gpt-4"}'
CUSTOM_COMMAND_cn2en = '/setenvs {"SYSTEM_INIT_MESSAGE": "You are a translator. Please translate everything I say below into English."}'
```

## Custom commands description

If you want to add help information for a custom command, you can use environment variables to set `COMMAND_DESCRIPTION_XXX`, where `XXX` is the name of the command, such as `COMMAND_DESCRIPTION_azure`, and the value is the description of the command, such as `Switch AI provider to Azure`. This way, you can use `/help` to view the help information for the custom command.

The following are some examples of custom command help information.

| Command                     | Value                                            |
|-----------------------------|--------------------------------------------------|
| COMMAND_DESCRIPTION_azure   | Switch AI provider to Azure.                     |
| COMMAND_DESCRIPTION_workers | Switch AI provider to Workers                    |
| COMMAND_DESCRIPTION_gpt3    | Switch AI provider to OpenAI GPT-3.5 Turbo.      |
| COMMAND_DESCRIPTION_gpt4    | Switch AI provider to OpenAI GPT-4.              |
| COMMAND_DESCRIPTION_cn2en   | Translate the conversation content into English. |

If you are using TOML for configuration, you can use the following method:

```toml
COMMAND_DESCRIPTION_azure = 'Switch AI provider to Azure.'
COMMAND_DESCRIPTION_workers = 'Switch AI provider to Workers'
COMMAND_DESCRIPTION_gpt3 = 'Switch AI provider to OpenAI GPT-3.5 Turbo.'
COMMAND_DESCRIPTION_gpt4 = 'Switch AI provider to OpenAI GPT-4.'
COMMAND_DESCRIPTION_cn2en = 'Translate the conversation content into English.'
```

If you want to bind custom commands to the menu of Telegram, you can add the following environment variable `COMMAND_SCOPE_azure = "all_private_chats,all_group_chats,all_chat_administrators"`, so that the plugin will take effect in all private chats, group chats and groups.


## Model List

Supports using the `/models` command to get a list of supported models and switching between them via menu selections.
The supported configuration items for the models list are of type URL or json array. If it is a URL, the list of models will be requested automatically, if it is a json array, the array will be used directly.
Current AI providers that support fetching the model list from a URL are `openai, workers, mistral, cohere`. AI providers that only support json arrays are `azure, gemini, anthropic`.
When the model list configuration is empty for an AI provider that supports fetching the model list from a URL, the URL for fetching the model list will be automatically spliced according to its base api by default.

| AI provider | Model List Configuration Key   | Default value                                             | Automatically generated value                                                                                    |
|:------------|--------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| openai      | OPENAI_CHAT_MODELS_LIST        | ``                                                        | `${OPENAI_API_BASE}/models`                                                                                      |
| workers     | WORKERS_CHAT_MODELS_LIST       | ``                                                        | `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/models/search?task=Text%20Generation` |
| mistral     | MISTRAL_CHAT_MODELS_LIST       | ``                                                        | `${MISTRAL_API_BASE}/models`                                                                                     |
| cohere      | COHERE_CHAT_MODELS_LIST        | ``                                                        | `https://api.cohere.com/v1/models`                                                                               |
| azure       | AZURE_CHAT_MODELS_LIST         | `[]`                                                      |                                                                                                                  |
| gemini      | GOOGLE_COMPLETIONS_MODELS_LIST | `["gemini-1.5-flash"]`                                    |                                                                                                                  |
| anthropic   | ANTHROPIC_CHAT_MODELS_LIST     | `["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"]` |                                                                                                                  |
