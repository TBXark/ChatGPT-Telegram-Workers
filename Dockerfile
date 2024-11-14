FROM node:alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm
COPY . .
RUN pnpm install
RUN pnpm -r run build


FROM node:alpine AS production
WORKDIR /app
COPY packages/apps/local/package.docker.json package.json
RUN npm install
COPY --from=build /app/packages/apps/local/dist/index.js index.js
EXPOSE 8787
CMD ["npm", "run", "start"]