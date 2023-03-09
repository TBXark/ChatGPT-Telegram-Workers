TIMESTAMP_FILE := ./dist/timestamp # 兼容旧版更新逻辑
BUILDINFO_JSON := ./dist/buildinfo.json
OUTPUT_FILE := ./dist/index.js
ENTRY_FILE := main.js

ifeq (,$(shell which esbuild))
    export PATH := $(CURDIR)/node_modules/.bin:$(PATH)
endif

.PHONY: build
build:
	COMMIT_HASH=$$(git rev-parse --short HEAD) && \
	TIMESTAMP=$$(date +%s) && \
	echo "$$TIMESTAMP" > $(TIMESTAMP_FILE) && \
	echo "{\"sha\": \"$$COMMIT_HASH\", \"timestamp\": $$TIMESTAMP}" > $(BUILDINFO_JSON) && \
	esbuild $(ENTRY_FILE) --bundle --outfile=$(OUTPUT_FILE) --format=esm --define:process.env.BUILD_VERSION="'$$COMMIT_HASH'" --define:process.env.BUILD_TIMESTAMP="$$TIMESTAMP" 