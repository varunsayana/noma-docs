.PHONY: dev build down clean

dev:
	docker compose up --build

build:
	docker compose build

down:
	docker compose down

clean:
	docker compose down -v
	rm -rf node_modules
	rm -rf apps/web/.next
	rm -rf apps/api/dist
