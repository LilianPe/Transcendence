SHELL := bash
.ONESHELL:

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

update:
	make stop
	make build
	make start

reset:
	docker compose down -v --remove-orphans
	docker system prune -af --volumes
	docker compose up --build

init: 
	chmod 777 certs/ca.crt certs/ca.key certs/fullchain.crt certs/transcendence.key

env:
	cat > .env <<-'EOF'
	# ELK credentials
	ELASTIC_USERNAME=
	ELASTIC_PASSWORD=
	METAMASK_KEY=
	EOF

.PHONY: start stop logs build restart backend frontend reset update
