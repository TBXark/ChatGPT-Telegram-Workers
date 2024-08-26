# Local or Docker

## Configure
```json5
{
  "database": {
    "type": "local",// memory, local, sqlite, redis
    "path": "/app/data.db" // your database path
  },
  "server": { //  server configuration for webhook mode
    "hostname": "0.0.0.0",
    "port": 3000,
    "baseURL": "https://example.com"
  },
  'proxy': 'http://127.0.0.1:7890', // proxy for telegram api
  "mode": "webhook", // webhook, polling
}
```

## Run on local

### 1. Build cjs
```shell
yarn run build
```

### 2. Run
```shell
node dist/index.cjs
```
You can run `index.cjs` anywhere without npm


## Run on docker
### 1. Build image

```bash
yarn && yarn run docker
```

### 2. Run container

```bash
docker run -v $(pwd)/config.json:/app/config.json -p 8787:8787 chatgpt-telegram-bot:latest --name chatgpt-telegram-bot
```
