.PHONY: start-bd
start-bd:
	brew services start mongodb/brew/mongodb-community@4.4

.PHONY: server
server:
	npx ts-node src/server/app.ts

.PHONY: parser
parser: NODE_ENV := development
parser:
	START_FROM_STOP_POINT=$(START_FROM_STOP_POINT) \
	RETRY_ERROR_URLS=$(RETRY_ERROR_URLS) \
	npx ts-node src/parser/index.ts
