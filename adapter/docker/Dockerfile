FROM node:18-alpine

WORKDIR /app
COPY . ./
WORKDIR /app/adapter/docker
RUN npm install
ENV DOMAIN "http://localhost"
VOLUME /app/adapter/docker/config
EXPOSE 8787

CMD [ "node", "index.js" ]