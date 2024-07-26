FROM node:18 AS build

WORKDIR /app
COPY package*.json index.js ./
RUN npm install
RUN apt-get update && apt-get install -y sqlite3
VOLUME /app/config
EXPOSE 8787

CMD [ "node", "index.js" ]