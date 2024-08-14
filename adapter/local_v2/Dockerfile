FROM node:20
WORKDIR /app
COPY ./build/index.js /app/index.js
ENV CONFIG_PATH=/app/config.json
ENV CACHE_PATH=/app/cache.json
CMD [ "node", "index.js" ]
