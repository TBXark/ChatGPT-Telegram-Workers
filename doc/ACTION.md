# Github Action 自动更新流程

## 1. 手动完成一次部署
具体部署流程看[部署流程](DEPLOY.md)

## 2. Fork 本仓库


## 3. 创建Cloudflare API TOKEN
要创建一个具有 Workers 权限的 Cloudflare API Token，请按照以下步骤操作：

1. 登录 Cloudflare 帐户并导航到“我的资料”页面。
2. 在左侧菜单中选择“API Tokens”。
3. 点击“Create Token”按钮。
4. 在 API token templates 中选择 Edit Cloudflare Workers
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635764-54bf4418-3571-49e4-8c41-a4d331f3d791.png">
6. 在“Zone Resources”下拉菜单中，选择要授权的区域。
7. 在“Account Resources”下拉菜单中，选择要授权的帐户。
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635869-aabb8ca6-7933-4f48-920f-6579d29947a8.png">
8. 点击“Create Token”按钮。
> 现在您已创建一个具有 Workers 权限的 Cloudflare API Token。请记住，API Token 的安全性非常重要，请不要在不必要的情况下共享它，并定期更改 API Token。

## 4. 设置 Action 的 Secrets
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635458-cd4dd1ef-6ff6-4b49-bcf5-f1224d6b62af.png">

1. 在 Github 仓库的 Settings -> Secrets 中添加以下 Secrets
    - CF_API_TOKEN: 你的Cloudflare API TOKEN
    - WRANGLER_TOML: 完整的 wrangler.toml 文件内容，可以参考[wrangler-example.toml](../wrangler-example.toml)
    - CF_WORKERS_DOMAIN（可选）: 你的Cloudflare Workers 路由（Workers 路由里你的*.workers.dev值，不带https://）
2. 在 Github 仓库的 Settings -> Actions 中，将 Actions 启用


## 4. 同步我的仓库
1. 为了安全起见，你fork的仓库不会同步更新我的仓库，所以你需要手动同步我的仓库
2. 当你手动同步我的仓库后，你的仓库会自动触发 Action，自动部署
3. 如果你想省略这一步你可以自己加一个自动同步我的仓库的Action
    1. 在你的仓库中创建一个文件，文件名为：`.github/workflows/sync.yml`
    2. 将下面的内容复制到文件中
    3. 下面代码未经测试，仅提供参考
    ```yml
    name: Sync
    on:
      schedule:
        - cron: '0 0 * * *'
    jobs:
      sync:
        runs-on: ubuntu-latest
        steps:
        - name: Sync
          uses: repo-sync/github-sync@v2
          with:
            source_repo: 'https://github.com/TBXark/ChatGPT-Telegram-Workers'
            target_repo: '填写你的仓库地址'
            github_token: ${{ secrets.GITHUB_TOKEN }} 
            source_branch: 'master'
  ```
