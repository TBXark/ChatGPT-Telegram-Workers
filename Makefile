export PATH := $(shell pwd)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

.PHONY: init
init:
	npm install -g pnpm
	pnpm install

.PHONY: version
version:
	pnpm run version

.PHONY: core
core: version
	pnpm run --filter @chatgpt-telegram-workers/core build

.PHONY: next
next: core
	pnpm run --filter @chatgpt-telegram-workers/next build

.PHONY: local
local: next
	pnpm run --filter @chatgpt-telegram-workers/local build

.PHONY: vercel
vercel: core
	pnpm run --filter @chatgpt-telegram-workers/vercel build

.PHONY: workers
workers: core
	pnpm run --filter @chatgpt-telegram-workers/workers build
	cp -r packages/apps/workers/dist/* dist/

.PHONY: workers-next
workers-next: next
	pnpm run --filter @chatgpt-telegram-workers/workers build

.PHONY: all
all:
	pnpm -r run build

.PHONY: docker
docker:
	docker build -t chatgpt-telegram-workers:latest .

.PHONY: docker-all
docker-all:
	docker build --platform linux/amd64,linux/arm64 -t tbxark/chatgpt-telegram-workers:latest --push .

.PHONY: deploy-workers
deploy-workers: workers
	wrangler deploy --config=wrangler.toml

