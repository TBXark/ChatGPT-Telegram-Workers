# 调试指南

### 说明

由于国内糟糕的网络环境, 导致使用`wrangler dev`调试基本不太可能。使用 cloudflare workers 网页面板调试也比较复杂。所以这里提供一个简单的适配器[cloudflare-worker-adapter](https://github.com/tbxark/cloudflare-worker-adapter)，可以在本地调试。

可以使用 vscode 断点调试，加上`nodemon`可以实现热更新。

### 已知 BUG

当前项目使用较多全局变量，在测试环境，这些全局变量只会初始化一次，这就导致每个新的会话可能使用上一个会话的上下文数据。这并不会像 cloudflare 一样，每次会话都是一个独立的环境。这在多个角色聊天的时候会产生 BUG。所以请勿将此用于生产环境。

### 使用步骤

1. 创建`config.json`

为了隐私安全，这里把本地的一些配置写在了`config.json`。请自行实现。

```json
{
  "port": 8787,
  "host": "0.0.0.0",
  "server": "https://workers.example.cn",
  "database": "./database.json"
}
```

2. 端口映射

为了让 telegram 的 webhook 可以访问到本地的服务，需要进行端口映射。可以使用`ngrok`或者`frp`等工具。只时候把你的`server`配置成`https://xxxxx.ngrok.io`即可。

3. 启动

```bash
npm run start
```

重新调用`https://xxxxx.ngrok.io/init`接口即可。

4. 数据库

在[cloudflare-worker-adapter](https://github.com/tbxark/cloudflare-worker-adapter)一共写了 4 种 KV 的实现`LocalCache`, `MemoryCache`, `RemoteCache`, `SqliteCache`。
这里推荐使用本地数据库存储，如果使用内存数据库可能导致数据丢失。当然你也可以使用远程数据库，但是这个可能比较慢，还需要你单独部署一个 workers 来实现。详情你可以到[cloudflare-worker-adapter](https://github.com/tbxark/cloudflare-worker-adapter)查看源代码。

这个测试例子里我用 sqlite3 来实现的。你可以自行实现自己的存储逻辑。

5. 代理环境

由于调用了 telegram 的 api，所以必须要给`fetch`代理环境。默认会读取`config.json`里的`https_proxy`字段。如果没有配置这个字段则会读取环境变量`https_proxy`。如果都没有配置则不会代理。但是这样可能会导致请求 telegram 的 api 失败。

6. 调试

使用 vscode 调试的时候，要在`package.json`里按`debug`按钮，并选择对于脚本才能进行调试。
