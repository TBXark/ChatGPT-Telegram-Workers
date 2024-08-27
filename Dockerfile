FROM node:alpine as DEV

WORKDIR /app
COPY package.json vite.config.ts tsconfig.json ./
COPY src ./src
CMD ["/bin/bash"]
RUN npm install && npm run build:local

FROM node:alpine as PROD

WORKDIR /app
COPY --from=DEV /app/dist /app/dist
COPY --from=DEV /app/package.json /app/
RUN npm install --only=production --omit=dev
RUN apk add --no-cache sqlite
EXPOSE 8787
CMD ["npm", "run", "start:dist"]
