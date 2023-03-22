# ChatGPT-Telegram-Workers

The easiest and fastest way to deploy your own ChatGPT Telegram bot. Using Cloudflare Workers, it is a single file that can be copied and pasted directly without any dependencies, local development environment configuration, domain name, or server. You can customize the system initialization information so that your debugged personality never disappears.

![](./../demo.jpg)

## Branches
- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) version with few bugs after testing
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev) version with some new features, but not fully tested, and basically usable

## Configuration
It is recommended to fill in the environment variables in the Workers configuration interface, rather than directly modifying the variables in the js code. For more information, see [Configuration](./doc/CONFIG.md).

## Deployment Process
For more information, see [Deployment Process](./doc/DEPLOY.md).

## Automatic Update
Automatically update using Github Action, for more information, see [Automatic Update](./doc/ACTION.md).


## Best Practices
~~Create multiple robots bound to the same workers, set `TELEGRAM_AVAILABLE_TOKENS`, and assign each robot a different `SYSTEM_INIT_MESSAGE`.~~ Enable group chat mode, create multiple group chats, each with its own robot, and give each robot a different `SYSTEM_INIT_MESSAGE`, such as translation expert, copywriting expert, and code expert. Then, chat with the robots in different groups according to your needs, so you don't have to switch configuration properties frequently.

## Known Issues
- ~~Group messages can only be called by administrators of the bot~~
- ~~Long messages are truncated by Telegram~~

## Update Log
- v1.4.0
  - Support deployment on multiple platforms
  - Added `/redo` command to resend or modify the previous question
  - Added multi-language support. Use the `LANGUAGE` environment variable to set the language. Currently supports `zh-CN`, `zh-TW`, and `en`. The default language is `zh-CN`.
    
For other update logs, see [CHANGELOG.md](./doc/CHANGELOG.md).


## Contributors

This project exists thanks to all the people who contribute. [Contribute](https://github.com/tbxark/ChatGPT-Telegram-Workers/graphs/contributors).

## License

**ChatGPT-Telegram-Workers** is released under the MIT license. [See LICENSE](../../LICENSE) for details.
