FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY index.js ./
ENV DOMAIN "http://localhost"
VOLUME /app/config
EXPOSE 8787

CMD [ "node", "index.js" ]