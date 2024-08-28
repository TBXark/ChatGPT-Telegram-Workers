# Deploy using Vercel (experimental)

The `/src/adapter/vercel` provides sample code that can complete Vercel deployment and basic functional testing. However, it cannot guarantee that all functions will work properly.

```shell
yarn global add vercel   # Install the Vercel command-line tool.
yarn                     # Install dependencies.
yarn run build:vercel    # Compile code specifically for Vercel.
yarn run prepare:vercel  # Convert the wrangler.toml configuration file to Vercel env. This step will be particularly slow, so it is only necessary to run it when your wrangler.toml configuration changes.
yarn run deploy:vercel   # Deploy to Vercel.
```

### Known issue.
1. There is a problem with closing Redis connections, which can cause too many client connections and make it impossible to connect. It is recommended to use Upstash's Redis service.