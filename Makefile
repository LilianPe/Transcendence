start:
	docker compose up -d

stop:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

restart:
	docker compose down && docker compose up -d

backend:
	docker compose exec backend sh

frontend:
	docker compose exec frontend sh
