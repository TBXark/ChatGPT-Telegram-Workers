# 更新日志

- v1.10.0
  - 使用 InlineKeyboards 切换模型

- v1.9.0
  - 添加插件系统

- v1.8.0
  - 支持Cohere,Anthropic Ai
  - 支持图片输入
  - 适配群组话题模式
  - 移除role功能,使用自定义指令代替
  - 修复超长文本发送失败BUG

- v1.7.0
  - 修改 worker ai 调用方式为 api 调用，需要设置 account_id 和 token, 原有AI绑定方式失效
  - 添加 worker ai 文字对话流模式支持
  - 添加 worker ai 文字生成图片功能
  - 添加添加AI提供商切换功能
  - 添加自定义指令功能，可以实现快速模型切换
  - 添加锁定用户自定义配置功能

- v1.6.0
  - 添加workers ai支持,具体配置查看配置文档
  - 优化openai流模式解析器

- v1.5.0
  - perf: 调整命令顺序
  - perf: openai发送请求前前发送loading消息
  - feat: 添加流式输出支持。默认开启。使用`STREAM_MODE=false`关闭
  - feat: 增加对多个KEY的适配，随机选择KEY使用
  - feat: 增加快捷按钮 `/new`, `/redo`

- v1.4.0
  - 支持多平台部署
  - 添加`/redo`指令，重新发送或者修改上一条提问
  - 添加`/delenv`指令，删除环境变量恢复默认值
  - 添加多语言支持，使用`LANGUAGE`环境变量设置语言，目前支持`zh-CN`，`zh-TW`和`en`。默认为`zh-CN`。
  
- v1.3.1
    - 优化历史记录裁剪逻辑
    - 优化token计算逻辑
    - 修复edit消息的bug
    
- v1.3.0
    - 添加token使用统计指令`/usage`
    - 添加系统信息指令`/system`
    - 添加command菜单显示范围
    - 添加`SYSTEM_INIT_MESSAGE`环境变量
    - 添加`CHAT_MODEL`环境变量
    - 添加`Github Action`自动更新部署脚本
    - 优化`/init`页面 显示更多错误信息
    - 修复历史记录裁剪BUG
    - 修复`USER_CONFIG`加载异常BUG
    - 修复把错误信息存入历史记录BUG

- v1.2.0
    - 修复高危漏洞，必须更新
    
- v1.1.0
    - 由单文件改为多文件，方便维护，提供dist目录，方便复制粘贴。
    - 删除和新增部分配置，提供兼容性代码，方便升级。
    - 修改KV key生成逻辑，可能导致之前的数据丢失，可手动修改key或重新配置。
    - 修复部分bug
    - 自动绑定所有指令
    - BREAKING CHANGE： 重大改动，必须把群ID加到白名单`CHAT_GROUP_WHITE_LIST`才能使用, 否则任何人都可以把你的机器人加到群组中，然后消耗你的配额。

- v1.0.0
    - 初始版本
