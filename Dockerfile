FROM node:20 as DEV

WORKDIR /app
COPY package.json vite.config.ts tsconfig.json ./
COPY src ./src
CMD ["/bin/bash"]
RUN npm install && npm run build:local

FROM node:20 as PROD

WORKDIR /app
COPY --from=DEV /app/dist /app/dist
COPY --from=DEV /app/package.json /app/
RUN npm install --only=production --omit=dev
CMD ["npm", "run", "start:dist"]
