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

init: certs env
	@echo "You should feed your .env !"

certs:
	mkdir -p certs

	cat > certs/openssl.cnf <<-'EOF'
	[ req ]
	distinguished_name = req_distinguished_name
	x509_extensions = v3_req
	prompt = no

	[ req_distinguished_name ]
	CN = localhost

	[ v3_req ]
	subjectAltName = @alt_names

	[ alt_names ]
	DNS.1 = localhost
	DNS.2 = elasticsearch
	DNS.3 = kibana
	EOF

	openssl genrsa -out certs/ca.key 4096
	
	openssl req -x509 -new -nodes -key certs/ca.key \
		-sha256 -days 3650 \
		-subj "/CN=MyLocalCA" \
		-out certs/ca.crt
	
	openssl genrsa -out certs/transcendence.key 4096
	
	openssl req -new -key certs/transcendence.key \
		-config certs/openssl.cnf \
		-out certs/transcendence.csr
	openssl x509 -req -in certs/transcendence.csr \
		-CA certs/ca.crt -CAkey certs/ca.key -CAcreateserial \
		-out certs/fullchain.crt -days 3650 \
		-extensions v3_req -extfile certs/openssl.cnf
	
	rm -f certs/transcendence.csr certs/openssl.cnf certs/*.srl


env:
	cat > .env <<-'EOF'
	# ELK credentials
	ELASTIC_USERNAME=
	ELASTIC_PASSWORD=
	EOF

.PHONY: start stop logs build restart backend frontend reset update
