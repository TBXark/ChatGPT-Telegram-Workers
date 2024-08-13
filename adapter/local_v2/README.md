# 本地部署（无需域名版本）

## 使用步骤
1. 使用 `npm run config` 将toml配置文件转换为json配置文件

### 本地运行
1. 使用 `npm run start` 启动服务

### Docker运行
1. 使用 `npm run docker` 构建镜像
2. 使用 `docker run -v $(pwd)/config.json:/app/config.json -v $(pwd)/cache.json:/app/cache.json -p 3000:3000 -d adapter` 启动容器