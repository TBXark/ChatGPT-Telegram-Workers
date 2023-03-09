# Changelog

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