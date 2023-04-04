# Configuration

It is recommended to fill in environment variables in the Workers configuration interface, rather than directly modifying variables in the JS code.

### KV Configuration
|KEY|Special Explanation|
|--|--|
|DATABASE|Create KV first, name it arbitrarily, and then set it to DATABASE when binding.|

### System Configuration
Configuration that is common to each user, usually filled in the Workers configuration interface.

|KEY|Explanation|Default Value|Special Explanation|
|--|--|--|--|
|API_KEY|OpenAI API Key|`null`||
|TELEGRAM_AVAILABLE_TOKENS|Support for multiple Telegram Bot Tokens|`null`|Separate multiple tokens with `,`|
|CHAT_WHITE_LIST|Chat ID whitelist|`null`|Separate multiple IDs with `,`. If you don't know the ID, you can chat with the bot and it will return it.|
|I_AM_A_GENEROUS_PERSON|Close the whitelist and allow everyone to access|`false`|Since many people do not want to set a whitelist, or do not know how to get the ID, this option is set to allow everyone to access when the value is `true`.|
|AUTO_TRIM_HISTORY|Automatically clear chat history|`true`|To avoid the 4096 character limit, messages will be truncated.|
|MAX_HISTORY_LENGTH|Maximum chat history length|`20`|`AUTO_TRIM_HISTORY is enabled` To avoid the 4096 character limit, messages will be truncated.|
|CHAT_MODEL|OpenAI model selection|`gpt-3.5-turbo`||
|SYSTEM_INIT_MESSAGE|init message for chatgpt|`你是一个得力的助手`||
|DEBUG_MODE|Debug mode|`false`|Currently, the latest message can be saved to KV for easy debugging.|

### Group Configuration
You can add the bot to a group, and then everyone in the group can chat with the bot.
> BREAKING CHANGE:
> Major changes, you must add the group ID to the whitelist `CHAT_GROUP_WHITE_LIST` to use it, otherwise anyone can add your bot to the group and consume your quota.

> IMPORTANT: Due to the privacy and security policies of restricted Telegram groups, if your group is a public group or has more than 2000 people, please set the bot as `administrator`, otherwise the bot will not respond to chat messages with `@bot`.

> IMPORTANT：Must set `/setprivacy` to `disable` in botfather, otherwise the bot will not respond to chat messages with `@bot`.

|KEY|Explanation|Default Value|Special Explanation|
|--|--|--|--|
|GROUP_CHAT_BOT_ENABLE|Enable group chat bot|`true`|After enabling, the bot joins the group and everyone in the group can chat with the bot.|
|TELEGRAM_BOT_NAME|Bot name xxx_bot|`null`|The order must be consistent with `TELEGRAM_AVAILABLE_TOKENS`, **must be set, otherwise it cannot be used in group chat**|
|GROUP_CHAT_BOT_SHARE_MODE|Share chat history of group chat bot|`false`|After enabling, the group has only one session and configuration. If disabled, each person in the group has their own session context.|
|CHAT_GROUP_WHITE_LIST|Group chat ID whitelist|`null`|Separate multiple IDs with `,`. If you don't know the ID, you can chat with the bot in the group and it will return it.|

### User Configuration
Custom configuration for each user, can only be modified by sending a message to Telegram, the message format is `/setenv KEY=VALUE`
|KEY|Explanation|Example|
|--|--|--|
|SYSTEM_INIT_MESSAGE|System initialization parameters, even if a new session is started, it can still be maintained without debugging every time|`/setenv SYSTEM_INIT_MESSAGE=Now it's Meow Niang, and every sentence ends with "meow"`|
|OPENAI_API_EXTRA_PARAMS|Additional parameters for OpenAI API, which will be carried every time the API is called after setting, and can be used to adjust temperature and other parameters|`/setenv OPENAI_API_EXTRA_PARAMS={"temperature": 0.5}` Each modification must be a complete JSON.|