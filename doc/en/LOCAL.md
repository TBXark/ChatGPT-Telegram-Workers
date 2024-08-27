# Local Deployment

## Configure

### 1. server config

```json5
{
  "database": {
    "type": "local",// memory, local, sqlite, redis
    "path": "/app/data.db" // your database path
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

### 2. toml config
the toml is compatible with the cloudflare workers config file


## Run on local

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


## Run on docker

Go to the root directory of the project

### 1. Build image

```bash
docker build -t chatgpt-telegram-workers:latest .
```

or

```shell
npm run build:docker # more faster
```

### 2. Run container

```bash
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro chatgpt-telegram-workers:latest
```


## Run with docker-compose

Go to the root directory of the project

### 1. Build image

```bash
docker-compose up # edit the docker-compose.yml to change the config file path
```

### 3. Run with docker hub

https://hub.docker.com/r/tbxark/chatgpt-telegram-workers

```shell
docker pull tbxark/chatgpt-telegram-workers
docker run -d -p 8787:8787 -v $(pwd)/config.json:/app/config.json:ro -v $(pwd)/wrangler.toml:/app/config.toml:ro chatgpt-telegram-workers:latest
```
