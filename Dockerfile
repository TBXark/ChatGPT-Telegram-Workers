FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm fetch --prod
RUN pnpm run build:local
RUN pnpm deploy --filter @chatgpt-telegram-workers/local --prod /prod/local

FROM base AS prod
COPY --from=build /prod/local /prod/local
WORKDIR /prod/local
EXPOSE 8787
CMD [ "pnpm", "start:dist" ]