# 本地部署（无需域名版本）


## 使用步骤
1. 创建配置文件
   1. 使用 `npm run config` 将toml配置文件转换为json配置文件
   2. 或者修改 `config-example.json` 为 `config.json` 并修改其中的配置
2. 如果你的网络环境需要代理，请在 `index.js` 中修改相关注释代码

### 本地运行
1. 使用 `npm run start` 启动服务

### Docker运行
1. 使用 `npm run docker` 构建镜像
2. 使用 `docker run -v $(pwd)/config.json:/app/config.json -v $(pwd)/cache.json:/app/cache.json chatgpt-telegram-bot:latest --name chatgpt-telegram-bot` 运行容器