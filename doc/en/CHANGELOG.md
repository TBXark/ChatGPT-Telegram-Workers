# Changelog

- v1.10.0
  - Switching Models with InlineKeyboards

- v1.9.0
  - Add plugin system

- v1.8.0
  - Support Cohere, Anthropic Ai
  - Support image input.
  - Adapt to group topic mode
  - Remove the role function and use custom commands instead.
  - Fix the bug of failure to send super long text.

- v1.7.0
  - Modify the worker AI invocation method to API invocation, requiring the setting of account_id and token. The original AI binding method is invalid.
  - Add support for worker AI text conversation flow mode.
  - Add functionality for worker AI to generate images from text.
  - Add switch AI providers
  - Add custom commands, which allows for quick model switching
  - Add lock user-defined configurations

- v1.6.0
  - Add workers AI support, please refer to the configuration document for specific settings.
  - Optimize the parser for openai stream mode.

- v1.5.0
  - perf: Adjust command order
  - perf: Send loading message before sending request to OpenAI
  - feat: Add support for streaming output. Enabled by default. Use `STREAM_MODE=false` to disable.
  - feat: Add compatibility for multiple keys, randomly select a key to use.
  - feat: Add shortcut buttons `/new`, `/redo`.

- v1.4.0
  - Support deployment on multiple platforms
  - Added `/redo` command to resend or modify the previous question
  - Added multi-language support. Use the `LANGUAGE` environment variable to set the language. Currently supports `zh-CN`, `zh-TW`, and `en`. The default language is `zh-CN`.

- v1.3.1
    - Optimized history trimming logic
    - Optimized token calculation logic
    - Fixed a bug in edit messages.

- v1.3.0
    - Added command `/usage` to show token usage statistics.
    - Added command `/system` to show system information.
    - Added option to show command menu only in specific scopes.
    - Added environment variable `SYSTEM_INIT_MESSAGE`.
    - Added environment variable `CHAT_MODEL`.
    - Added automatic deployment script using `Github Action`.
    - Improved `/init` page to display more error information.
    - Fixed bug with historical record clipping.

- v1.2.0
    - Fixed critical vulnerability, update is mandatory.
    
- v1.1.0
    - Changed from single file to multiple files for easier maintenance, provided "dist" directory for easier copying and pasting.
    - Removed and added some configurations, provided compatibility code for easier upgrading.
    - Modified KV key generation logic, which may cause data loss, manual modification of keys or reconfiguration is required.
    - Fixed some bugs.
    - Automatically bind all commands.
    - BREAKING CHANGE: Major changes, the group ID must be added to the whitelist "CHAT_GROUP_WHITE_LIST" in order to use it. Otherwise, anyone can add your bot to the group and consume your quota.

- v1.0.0
    - Initial version.
