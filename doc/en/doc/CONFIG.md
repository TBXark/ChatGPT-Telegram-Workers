# Configuration

It is recommended to fill in environment variables in the Workers configuration interface, rather than directly modifying variables in the JS code.

### KV Configuration
| KEY      | Special Explanation                                          |
| :------- | ------------------------------------------------------------ |
| DATABASE | Create KV first, name it arbitrarily, and then set it to DATABASE when binding. |

### System Configuration
Configuration that is common to each user, usually filled in the Workers configuration interface.

| KEY | Description | Default | Special Notes |
|:--------------------------|------------------------|----------------------------|----------------------------------------------- ----------------------------------------------------------------------------------|
| API_KEY | OpenAI API Key | `null` | Multiple keys can be used at the same time, and one will be randomly selected when used |
| CHAT_MODEL | open ai model selection | `gpt-3.5-turbo` | |
| - | - | - | - |
| TELEGRAM_AVAILABLE_TOKENS | Support for multiple Telegram Bot Token | `null` | Multiple Token separated by `,` |
| - | - | - | - |
| CHAT_WHITE_LIST | Chat ID whitelist | `null` | Multiple IDs separated by `,`, don't know the IDs, talk to the bot for one sentence to return |
| I_AM_A_GENEROUS_PERSON | Turn off whitelisting and allow everyone to access | `false` | Since many people don't want to whitelist, or don't know how to get IDs, set this option to allow everyone to access, takes effect when value is `true` |
| - | - | - | - |
| AUTO_TRIM_HISTORY | Automatically clean up history | `true` | Truncate messages to avoid 4096 character limit |
| MAX_HISTORY_LENGTH | Maximum history length | `20` | `When AUTO_TRIM_HISTORY is turned on` To avoid the 4096 character limit, trim messages down |
| MAX_TOKEN_LENGTH | Maximum number of history tokens | 2048 | Too long and easy to timeout suggest to set it at a suitable number |
| GPT3_TOKENS_COUNT | GTP counting mode | `false` | Use more accurate token counting mode instead of just judging the length of the string, but it is easy to timeout |
| - | - | - | - |
| SYSTEM_INIT_MESSAGE | System initialization information | `You're a capable assistant` | Default bot settings |
| - | - | - | - |
| ENABLE_USAGE_STATISTICS | Enable usage statistics | `false` | When enabled, each API call is logged to the KV and can be viewed via `/usage` |
| HIDE_COMMAND_BUTTONS | Hide command buttons | `null` | Write the buttons you want to hide in comma separated by `/start,/system`, remember to put slashes in them, you will have to reinit |
| SHOW_REPLY_BUTTON | show reply button | `false` | show reply button |
| - | - | - | - |
| UPDATE_BRANCH | Branching | `master` | Version checking branch |
| - | - | - | - |
| DEBUG_MODE | Debug Mode | `false` | Currently you can save the latest message to KV for debugging, but it consumes a lot of KV writes.|
| DEV_MODE | Development Mode | `false` | For development and testing |
| STREAM_MODE | Streaming Mode | `true` | Get ChatGPT Web-like typewriter output mode |
| SAFE_MODE | Safe Mode | `true` | Safe Mode, it will increase KV write loss, but it can avoid Telegram death loop retry caused by Workers timeout, and reduce the waste of Token, it's not recommended to turn it off. |
| - | - | - | - |
| LANGUAGE | Language | `zh-CN` | `zh-CN`, `zh-TW` and `en` |
| - | - | - | - |
| TELEGRAM_API_DOMAIN | Telegram | `https://api.telegram.org` | Can customize Telegram server |
| OPENAI_API_DOMAIN | OpenAI | `https://api.openai.com` | can be replaced with other domains from other service providers compatible with the OpenAI API |
| - | - | - | - |
| AZURE_API_KEY | azure api key | `null` | Supports azure's API, just pick one of the two keys |
| AZURE_COMPLETIONS_API | azure api url | `null` | format `https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/ chat/completions?api-version=2023-05-15` |



### Group Configuration
You can add the bot to a group, and then everyone in the group can chat with the bot.
> BREAKING CHANGE:
> Major changes, you must add the group ID to the whitelist `CHAT_GROUP_WHITE_LIST` to use it, otherwise anyone can add your bot to the group and consume your quota.

> IMPORTANT: Due to the privacy and security policies of restricted Telegram groups, if your group is a public group or has more than 2000 people, please set the bot as `administrator`, otherwise the bot will not respond to chat messages with `@bot`.

> IMPORTANT：Must set `/setprivacy` to `disable` in botfather, otherwise the bot will not respond to chat messages with `@bot`.

| KEY                       | Explanation                          | Default Value | Special Explanation                                          |
| :------------------------ | ------------------------------------ | ------------- | ------------------------------------------------------------ |
| GROUP_CHAT_BOT_ENABLE     | Enable group chat bot                | `true`        | After enabling, the bot joins the group and everyone in the group can chat with the bot. |
| TELEGRAM_BOT_NAME         | Bot name xxx_bot                     | `null`        | The order must be consistent with `TELEGRAM_AVAILABLE_TOKENS`, **must be set, otherwise it cannot be used in group chat** |
| GROUP_CHAT_BOT_SHARE_MODE | Share chat history of group chat bot | `false`       | After enabling, the group has only one session and configuration. If disabled, each person in the group has their own session context. |
| CHAT_GROUP_WHITE_LIST     | Group chat ID whitelist              | `null`        | Separate multiple IDs with `,`. If you don't know the ID, you can chat with the bot in the group and it will return it. |

### User Configuration
Custom configuration for each user, can only be modified by sending a message to Telegram, the message format is `/setenv KEY=VALUE`

| KEY                     | Explanation                                                  | Example                                                      |
| :---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| SYSTEM_INIT_MESSAGE     | System initialization parameters, even if a new session is started, it can still be maintained without debugging every time | `/setenv SYSTEM_INIT_MESSAGE=Now it's Meow Niang, and every sentence ends with "meow"` |
| OPENAI_API_EXTRA_PARAMS | Additional parameters for OpenAI API, which will be carried every time the API is called after setting, and can be used to adjust temperature and other parameters | `/setenv OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}` Each modification must be a complete JSON. |