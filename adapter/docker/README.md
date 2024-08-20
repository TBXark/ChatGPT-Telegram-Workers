# Docker

### 1. Build image

```bash
yarn && yarn run docker
```

### 2. Run container

```bash
docker run -v $(pwd)/config.json:/app/config.json -p 8787:8787 chatgpt-telegram-bot:latest --name chatgpt-telegram-bot
```

### 3. Configure
```json5
{
  "database": {
    "type": "sqlite",// memory, local, sqlite, redis
    "path": "/app/data.db" // your database path
  },
  "server": "https://example.com"
}
```