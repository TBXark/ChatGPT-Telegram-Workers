# 使用Vercel部署

## 1. 配置
在`adapter/vercel`目录下新建`.env`文件，填入以下内容：
```bash
# 这个是必填的, 可以部署成功之后vercel给你生成一个域名后重新填写再次部署
DOMAIN="https://你的域名.vercel.app" 
# 这个也是必填,可以使用redner的免费redis, 记得允许所有IP段
REDIS_URL="rediss://你的redis地址:6379" 
# 其他与主工程相同的配置
...
```

## 2. 部署
```bash
cd adapter/vercel
vercel deploy --prod
```