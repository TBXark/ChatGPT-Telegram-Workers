# 本地部署


## 配置

### 1. 服务器配置`CONFIG_PATH`

```json5
{
  "database": {
    "type": "local",// memory, local, sqlite, redis
    "path": "/app/data.json" // your database path
  },
  "server": { //  server configuration for webhook mode
    "hostname": "0.0.0.0",
    "port": 3000, // must 8787 when using docker
    "baseURL": "https://example.com"
  },
  'proxy': 'http://127.0.0.1:7890', // proxy for telegram api
  "mode": "webhook", // webhook, polling
}
```

### 2. toml 配置`TOML_PATH`
toml 内容与cloudflare workers配置文件兼容


## 本地运行

```shell
npm install
npm run start:local
```
or

```shell
npm install
npm run build:local
CONFIG_PATH=./config.json TOML_PATH=./wrangler.toml npm run start:dist
```


## Docker 运行

### 1. 编译image

```bash
docker build -t chatgpt-telegram-workers:latest .
```
or
```shell
npm run build:docker # 更快(直接使用本地构建的结果创建镜像)
```

### 2. 运行容器

```bash
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro chatgpt-telegram-workers:latest
```


## docker-compose 运行

自行修改docker-compose.yml中的配置文件路径

```bash
docker-compose up # edit the docker-compose.yml to change the config file path
```


## 使用Docker hub镜像

https://hub.docker.com/r/tbxark/chatgpt-telegram-workers

```shell
docker pull tbxark/chatgpt-telegram-workers
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro chatgpt-telegram-workers:latest
```
