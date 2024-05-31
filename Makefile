TIMESTAMP_FILE := ./dist/timestamp # 兼容旧版更新逻辑
BUILD_INFO_JSON := ./dist/buildinfo.json
OUTPUT_FILE := ./dist/index.js
ENTRY_FILE := main.js
ESLINT := ./node_modules/.bin/eslint
ESBUILD := ./node_modules/.bin/esbuild

.PHONY: build
build: clean
	COMMIT_HASH=$$(git rev-parse --short HEAD) && \
	TIMESTAMP=$$(date +%s) && \
	echo "$$TIMESTAMP" > $(TIMESTAMP_FILE) && \
	echo "{\"sha\": \"$$COMMIT_HASH\", \"timestamp\": $$TIMESTAMP}" > $(BUILD_INFO_JSON) && \
	$(ESBUILD) $(ENTRY_FILE) --bundle --outfile=$(OUTPUT_FILE) --format=esm --define:process.env.BUILD_VERSION="'$$COMMIT_HASH'" --define:process.env.BUILD_TIMESTAMP="$$TIMESTAMP"

.PHONY: clean
clean:
	rm -f $(TIMESTAMP_FILE) $(BUILD_INFO_JSON) $(OUTPUT_FILE)

.PHONY: lint
lint:
	$(ESLINT) --fix main.js src adapter
