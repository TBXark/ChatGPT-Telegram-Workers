# Github Action Auto-update Process

## 1. Complete one deployment manually
Refer to [Deployment Process](DEPLOY.md) for specific deployment steps.

## 2. Fork this repository


## 3. Create Cloudflare API TOKEN
To create a Cloudflare API Token with Workers permissions, follow these steps:

1. Log in to your Cloudflare account and navigate to the "My Profile" page.
2. Select "API Tokens" from the left-hand menu.
3. Click the "Create Token" button.
4. Choose "Edit Cloudflare Workers" from the API token templates.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635764-54bf4418-3571-49e4-8c41-a4d331f3d791.png">
6. In the "Zone Resources" dropdown menu, select the zone you want to authorize.
7. In the "Account Resources" dropdown menu, select the account you want to authorize.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635869-aabb8ca6-7933-4f48-920f-6579d29947a8.png">
8. Click the "Create Token" button.
> You have now created a Cloudflare API Token with Workers permissions. Remember, API Token security is very important. Do not share it unnecessarily and change your API Token regularly.

## 4. Set up Secrets for Actions
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635458-cd4dd1ef-6ff6-4b49-bcf5-f1224d6b62af.png">

1. Add the following Secrets to the Github repository's Settings -> Secrets
    - CF_API_TOKEN: Your Cloudflare API TOKEN
    - WRANGLER_TOML: The full content of the wrangler.toml file. Refer to [wrangler-example.toml](../../../wrangler-example.toml) for an example.
    - CF_WORKERS_DOMAIN (optional): Your Cloudflare Workers route (the value of your *.workers.dev in the Workers route, without https://)
2. Enable Actions in the Github repository's Settings -> Actions


## 4. Synchronize my repository
1. For security reasons, the repository you forked will not automatically sync with my repository. Therefore, you need to manually sync with my repository.
2. When you manually sync with my repository, your repository will automatically trigger the Action and deploy automatically.
3. If you want to skip this step, you can add an Action to automatically sync with my repository.
    1. Create a file in your repository named: `.github/workflows/sync.yml`
    2. Copy the following content to the file.
    3. The code below has not been tested and is for reference only.
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
                target_repo: 'Fill in your repository address'
                github_token: ${{ secrets.GITHUB_TOKEN }} 
                source_branch: 'master'
  ```