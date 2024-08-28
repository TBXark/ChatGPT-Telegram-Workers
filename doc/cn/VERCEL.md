# 使用Vercel部署 (实验性)

`/src/adapter/vercel`中提供了示例代码，可以完成Vercel部署，和基础的功能测试。但是无法保证所有功能都能正常工作。

```shell
yarn
yarn run build:vercel    # 编译vercel专用的代码
yarn run prepare:vercel  # 转换wrangler.toml配置文件到 vercel env
yarn run deploy:vercel   # 部署到vercel
```

### 已知问题
1. redis 连接关闭有问题会导致客户端连接数过多导致无法连接建议使用upstash的redis服务