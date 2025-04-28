#!/bin/bash

pkill vault
rm -rf /vault/data/*

echo "Starting Vault server in the background"
vault server -dev -config=/vault/config/vault.hcl > /tmp/vault.log 2>&1 &
echo "Vault server started"

sleep 5

cat /tmp/vault.log
root_token=$(grep -oP 'Root Token: \K.*' /tmp/vault.log)
echo -n "$root_token" > /vault/token/root_token.txt
echo "Root token: $root_token"
export VAULT_TOKEN="$root_token"

tail -f /dev/null