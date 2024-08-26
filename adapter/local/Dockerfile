FROM node:20
WORKDIR /app
COPY ./build/index.js /app/index.ts
RUN apt-get update && apt-get install -y sqlite3
ENV CONFIG_PATH=/app/config.json
ENV CACHE_PATH=/app/cache.json
EXPOSE 8787
CMD [ "node", "index.ts" ]
