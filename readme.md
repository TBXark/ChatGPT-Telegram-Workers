# Backend installation
Just open https://telegram.onour.org/ and go to step 2 if you don't want to install backend or
# 1.1 Setup backend on your AWS cloud

1. Sign up to aws.amazon.com and go to AMI Catalog 
2. Find ami-019a0836953fe72f3 (in "community ami") -> select -> run instance
3. Run instance based on this AMI (no keypair, allow http port).
4. (optional) go to AWS->EC2->instances you shoul see runned instance, connect to it using "connect" button  <img style="max-width: 600px;" src='https://onout.org/images/connect_aws_instance.png?r=1'>
5. (optional) run command ```cd ChatGPT-Telegram-Workers/ && git pull``` to update to the latest version 👍
6. Open http://54.157.243.154/ where 54.157.243.154 is your "public IPv4" address (see screnshot above)  (check you open http version, not https). you should see the deploy form

## (optional) add domain to your server
5. Add your domain to cloudflare.com and add subdomain "telegram.your-domain.com" (in the "DNS" section) linked to the IP you've got from amazon ("public IP of your instance"). Enable orange cloud, enable SSL -> flexible SSL.
6. Open telegram.your-domain.com in browser and follow the instructions

# 1.2 Setup backend on VPS (alternative to AWS)
1. Setup on your server 
```
git clone https://github.com/noxonsu/ChatGPT-Telegram-Workers.git
cd ChatGPT-Telegram-Workers
npm i
pm2 start ai2telegramservice.cjs
```

open http://ip:3006

## 2. Create Cloudflare API TOKEN
To create a Cloudflare.com API Token with Workers permissions, follow these steps:

1. Log in to your Cloudflare.com account, add site (you need a domain, you may register new there - check "domain registrations" tab in cloudflare) then navigate to the "My Profile" page. 
2. Select "API Tokens" from the left-hand menu.
3. Click the "Create Token" button.
4. Choose "Edit Cloudflare Workers" from the API token templates.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635764-54bf4418-3571-49e4-8c41-a4d331f3d791.png">
6. In the "Zone Resources" dropdown menu, select the domain you want to authorize.
7. In the "Account Resources" dropdown menu, select the account you want to authorize.
<img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223635869-aabb8ca6-7933-4f48-920f-6579d29947a8.png">
8. Click the "Create Token" button.
> You have now created a Cloudflare API Token with Workers permissions. Remember, API Token security is very important. Do not share it unnecessarily and change your API Token regularly.

## 3. Get openai key
..
## 4. Get bot api key from botfather
..
## 5. Open deploy form and activate using your license
<img src=https://user-images.githubusercontent.com/61930014/235964636-7f2df792-d665-444f-96d3-a7376cc6975e.png>
