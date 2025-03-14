FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack disable && npm install -g pnpm@latest

COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:local

FROM node:20-slim AS prod

WORKDIR /app

COPY --from=build /app/packages/apps/local/dist/index.js /app/dist/index.js
COPY --from=build /app/packages/apps/local/package-docker.json /app/package.json

RUN npm install
EXPOSE 8787

CMD ["node", "/app/dist/index.js"]