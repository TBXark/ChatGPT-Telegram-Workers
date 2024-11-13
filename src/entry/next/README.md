# ChatGPT-Telegram-Workers-Next 


## 中文

ChatGPT-Telegram-Workers-Next 是一个实验性质的版本, 使用 `https://github.com/vercel/ai` 驱动。比起原始版本支持更多特性。

此版本暂不提供`dist`文件，如果你想部署此版本，需要将 `wrangler.toml` 中的 `main` 修改为 `./src/entry/next/index.ts` 并添加nodejs支持`compatibility_flags = [ "nodejs_compat" ]`

然后使用`wrangler deploy`进行部署。


## English

ChatGPT-Telegram-Workers-Next is an experimental version, driven by `https://github.com/vercel/ai`. It supports more features than the original version.

This version does not provide the `dist` files. If you want to deploy this version, you need to modify `main` in `wrangler.toml` to `./src/entry/next/index.ts` and add nodejs support `compatibility_flags = [ "nodejs_compat" ]`.

Then use `wrangler deploy` to deploy.