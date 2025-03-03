.PHONY: run
run: ## Start the development docker container.
	docker compose up --build -d

.PHONY: down
down: ## Stop the development docker container.
	docker compose down

# .PHONY: lint
# lint: ## Fix the code style issues.
# 	docker compose exec remote-attendance npm run lint:fix

# .PHONY: format
# format: ## Format the code.
# 	docker compose exec mansion_watch_web npm run format

# .PHONY: ngrok
# ngrok: ## Start ngrok.
# 	ngrok http 3000
