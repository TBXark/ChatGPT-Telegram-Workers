# ChatGPT-Telegram-Workers

[English Version](./doc/en/README.md)

最簡單快捷部署屬於自己的ChatGPT Telegram機器人的方法。使用Cloudflare Workers，單文件，直接覆制粘貼一把梭，無需任何依賴，無需配置本地開發環境，不用域名，免服務器。
可以自定義系統初始化信息，讓你調試好的性格永遠不消失。

## 分支
- [`master`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master) 經過測試基本沒有BUG的版本
- [`dev`](https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/dev)    有一些新功能，但是沒有經過完整的測試，基本可用的版本

## 配置
> 推薦在Workers配置界面填寫環境變量， 而不是直接修改js代碼中的變量

詳情見 [配置文檔](./doc/CONFIG.md)

## 部署流程
詳情見 [部署流程](./doc/DEPLOY.md)

## 自動更新
> 使用Github Action自動更新

詳情見 [自動更新](./doc/ACTION.md)

## 最佳實踐
~~新建多個機器人綁定到同一個workers，設置`TELEGRAM_AVAILABLE_TOKENS`,每個機器人賦予不同的`SYSTEM_INIT_MESSAGE`~~。開啟群聊模式，新建多個群聊，每個群內只有自己個機器人，每個群的機器人由不同的`SYSTEM_INIT_MESSAGE`，比如翻譯專家，文案專家，代碼專家。然後每次根據自己的需求和不同的群里的機器人聊天，這樣就不用經常切換配置屬性。。

## 已知問題
- ~~群消息只能管理員調用bot~~
- 長消息被Telegram截斷

## 更新日志
- v1.3.0
    - 添加token使用統計指令`/usage`
    - 添加系統信息指令`/system`
    - 添加command菜單顯示範圍
    - 添加`SYSTEM_INIT_MESSAGE`環境變量
    - 添加`CHAT_MODEL`環境變量
    - 添加`Github Action`自動更新部署腳本
    - 優化`/init`頁面 顯示更多錯誤信息
    - 修覆歷史記錄裁剪BUG
    
其他更新日志見[CHANGELOG.md](./doc/CHANGELOG.md)
