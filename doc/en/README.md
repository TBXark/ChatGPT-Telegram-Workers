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
Create multiple bots bound to the same workers, set `TELEGRAM_AVAILABLE_TOKENS`, and assign each bot a different `SYSTEM_INIT_MESSAGE`. For example, translation experts, copywriting experts, code experts. Then chat with different bots according to your needs, so you don't have to switch configuration properties frequently.

## Known Issues
- ~~Group messages can only be called by administrators of the bot~~
- Long messages are truncated by Telegram

## Changelog
- v1.2.0
    - Fix critical vulnerabilities, must be updated
    
For other update logs, see [CHANGELOG.md](./doc/CHANGELOG.md).