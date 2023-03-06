TIMESTAMP_FILE := ./dist/timestamp
OUTPUT_FILE := ./dist/index.js
ENTRY_FILE := main.js

.PHONY: build
build:
	COMMIT_HASH=$$(git rev-parse --short HEAD) && \
	TIMESTAMP=$$(date +%s) && \
	echo "$$TIMESTAMP" > $(TIMESTAMP_FILE) && \
	esbuild $(ENTRY_FILE) --bundle --outfile=$(OUTPUT_FILE) --format=esm --define:process.env.BUILD_VERSION="'$$COMMIT_HASH'" --define:process.env.BUILD_TIMESTAMP="$$TIMESTAMP"
