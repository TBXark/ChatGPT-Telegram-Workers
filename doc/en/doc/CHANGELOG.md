# Changelog
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