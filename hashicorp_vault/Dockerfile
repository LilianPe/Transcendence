FROM debian:bullseye-slim

WORKDIR /vault

RUN apt-get update && apt-get install -y && apt-get upgrade -y \
    curl \
    gnupg \
    jq \
    netcat \
    procps \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bullseye main" | tee /etc/apt/sources.list.d/vault.list \
    && apt-get update && apt-get install -y \
    vault \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /vault/token

COPY config/vault.hcl /vault/config/vault.hcl

COPY config/setup.sh /vault/setup.sh

RUN chmod +x /vault/setup.sh

EXPOSE 8300

ENTRYPOINT ["/vault/setup.sh"]