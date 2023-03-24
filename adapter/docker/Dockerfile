FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
COPY index.js ./
RUN npm install
# RUN npm run build
# FROM gcr.io/distroless/nodejs18-debian11
# WORKDIR /app
# COPY --from=build /app/dist .
RUN apt-get update && apt-get install -y sqlite3
ENV DOMAIN "http://localhost"
VOLUME /app/config
EXPOSE 8787

CMD [ "node", "index.js" ]