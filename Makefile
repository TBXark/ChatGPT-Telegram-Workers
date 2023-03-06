TIMESTAMP_FILE := ./dist/timestamp
OUTPUT_FILE := ./dist/index.js
ENTRY_FILE := main.js

.PHONY: build
build:
	@echo $(shell date +%s) > $(TIMESTAMP_FILE)
	@esbuild $(ENTRY_FILE) --bundle --outfile=$(OUTPUT_FILE) --format=esm --define:process.env.BUILD_TIMESTAMP=$(shell cat $(TIMESTAMP_FILE))
