FROM node:alpine AS build
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
RUN npm install
COPY src src
RUN npm run build:local


FROM node:alpine AS production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8787
CMD ["npm", "run", "start:dist"]