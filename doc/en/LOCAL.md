# Local deployment


## Configuration

### 1. Server Configuration`CONFIG_PATH`

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

### 2. TOML configuration`TOML_PATH`
The toml content is compatible with Cloudflare Workers configuration files.


## Local run

```shell
pnpm install
pnpm run start:local
```
or

```shell
pnpm install
pnpm run build:local
CONFIG_PATH=./config.json TOML_PATH=./wrangler.toml pnpm run start:dist
```


## Docker

### 1. Build image

```bash
docker build -t chatgpt-telegram-workers:latest .
```
or
```shell
pnpm run build:docker # Faster (directly use the locally built results to create the image)
```

### 2. Run container

```bash
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro chatgpt-telegram-workers:latest
```


## docker-compose

Manually modify the configuration file path in docker-compose.yml.

```bash
docker-compose up # edit the docker-compose.yml to change the config file path
```


## Use docker hub image

https://github.com/TBXark/ChatGPT-Telegram-Workers/pkgs/container/chatgpt-telegram-workers

```shell
docker pull ghcr.io/tbxark/chatgpt-telegram-workers:latest
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro ghcr.io/tbxark/chatgpt-telegram-workers:latest
```
