# 本地部署

可将本项目在本地运行，方便调试。


### 使用步骤

#### 1. 创建`config.json`

为了隐私安全，这里把本地的一些配置写在了`config.json`。请自行实现。并放在`index.js`同级目录下。
```js
{
    // 本地端口，默认8787
    "port": 8787,   

    // 本地host，默认0.0.0.0
    "host": "0.0.0.0", 

    // 你的的域名，用于webhook绑定
    "server": "https://workers.example.cn", 

    // 默认内存数据库
    "database": { 
        // 数据库类型: 支持 memory, local, sqlite, redis
        "type": "sqlite", 
        // 当type为local时, uri为json文件路径
        // 当type为sqlite时, uri为数据库文件路径
        // 当type为redis时, uri为redis连接字符串
        "uri": "./database.json"
    },

    // 环境变量配置路径, 使用toml格式, 所有变量放在[vars]里面。格式与wrangler.toml兼容
    "toml": "../../wrangler.toml" 
}
```

#### 2. 端口映射

- 如果你没有公网IP，为了让telegram的webhook可以访问到本地的服务，需要进行端口映射。可以使用`ngrok`,`frp`或者`cloudflared`等工具。只时候把你的`config.json`里的`server`配置成临时的域名即可。
- 如果你有公网IP，自行配置域名解析即可。


#### 3. 启动

```bash
npm install
npm run start
```
重新调用`https://yourdomain.com/init`接口即可。

#### 4. 数据库

- `memory`: 默认使用内存数据库，重启后数据会丢失。
- `local`: 使用本地json文件数据库，需要配置`config.json`里的`database.uri`为json文件路径。
- `sqlite`: 使用sqlite数据库，需要配置`config.json`里的`database.uri`为数据库文件路径。linux需要安装`sqlite3`。方法为`sudo apt install sqlite3`。
- `redis`: 使用redis数据库，需要配置`config.json`里的`database.uri`为redis连接字符串。


#### 5. 代理环境

如果你的环境不能直接访问telegram的api，可以使用代理环境。必须要给`fetch`代理环境。默认会读取`config.json`里的`https_proxy`字段。如果没有配置这个字段则会读取环境变量`https_proxy`。如果都没有配置则不会代理。但是这样可能会导致请求telegram的api失败。


#### 6. 调试

使用vscode调试的时候，要在`package.json`里按`debug`按钮，并选择对于脚本才能进行调试。

#### 7. 设置`systemd`

如果你想要在linux上使用systemd来管理nodejs服务，可以添加下面文件到`/etc/systemd/system/`目录下。

```bash
[Unit]
Description=telegram-bot
After=network.target

[Service]
Type=simple
User=root # 你的用户名
WorkingDirectory=/root/telegram-bot/adapter/local # 你的项目路径
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=3
```

