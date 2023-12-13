# Local development guide

### Description

Debugging through the Cloudflare Workers web panel is relatively complex. Therefore, this guide provides a simple adapter, cloudflare-worker-adapter, which can be used for local debugging.
It's possible to use VSCode for breakpoint debugging, and with nodemon, hot updates can be achieved.

### Known BUG

The current project uses a large number of global variables. In the testing environment, these global variables are only initialized once, which may cause each new session to use the context data from the previous session. This does not behave like Cloudflare, where each session is an independent environment. This can cause bugs when multiple roles are chatting. Therefore, please do not use this for production environments.

### Steps

1. Create `./config.json`

For privacy and security reasons, some local configurations are placed in config.json. Please implement this yourself. Example:
```json
{
  "port": 3000,
  "host": "0.0.0.0",
  "server": "https://workers.example.com",
  "database": "./database.json"
}
```

2. Port mapping

To allow the Telegram webhook to access the local service, port mapping is needed. Tools like "ngrok" or "frp" can be used. At this time, set your server configuration to https://xxxxx.ngrok.io.

3. Start

```bash
npm run start
```

Reinvoke the https://xxxxx.ngrok.io/init interface.

4. Database

In `cloudflare-worker-adapter`, four kinds of KV implementations are written: LocalCache, MemoryCache, RemoteCache, SqliteCache.

It is recommended to use a local database for storage. If a memory database is used, it may lead to data loss. Of course, you can also use a remote database, but it may be slower and require deploying a separate worker. For details, you can view the source code at `cloudflare-worker-adapter`.

In this test example, sqlite3 is used for implementation. You can implement your own storage logic.

5. Proxy environment

Since the Telegram API is called, a proxy environment must be set for fetch. By default, the `https_proxy` field in `config.json` is read. If this field is not configured, the `https_proxy` environment variable is read. If neither is configured, no proxy will be used, which may lead to failure in calling the Telegram API.

6. Debugging

When using VSCode for debugging, press the debug button in `package.json` and select the corresponding script for debugging.
