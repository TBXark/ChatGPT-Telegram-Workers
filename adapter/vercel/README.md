# 使用Vercel部署


## 0. 初始化
初始化工程根据根目录的`wrangler.toml`自动创建`.env`
```bash
npm install
npm run init
```

## 1. 配置
补全`.env`文件，增加以下内容：
```bash
# 这个是必填的, 可以部署成功之后vercel给你生成一个域名后重新填写再次部署
VERCEL_DOMAIN="https://你的域名.vercel.app" 
# 这个也是必填,可以使用redner的免费redis, 记得允许所有IP段
REDIS_URL="rediss://你的redis地址:6379" 
# 其他与主工程相同的配置
...
```

## 2. 部署
```bash
cd adapter/vercel
npm run deploy
```

## 3. 注意
当你删减环境变量时，应到vercel的网页版删除对应的环境变量。