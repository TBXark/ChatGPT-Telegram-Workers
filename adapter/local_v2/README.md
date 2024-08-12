# 本地部署（无需域名版本）

## 使用步骤
1. 使用 `npm run config` 生成配置文件

### 本地运行
1. 使用 `npm run start` 启动服务

### Docker运行
1. 使用 `npm run docker` 构建镜像
2. 使用 `docker run -v $(pwd)/config.json:/app/config.json -p 8787:8787 chatgpt-telegram-adapter` 启动容器