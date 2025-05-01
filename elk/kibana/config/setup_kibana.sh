#!/usr/bin/env bash
set -euo pipefail

# 1) Wait for ES
echo "⏳ Waiting for Elasticsearch to come up…"
until curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    --cacert /usr/share/kibana/config/certs/ca.crt \
    https://elasticsearch:9200/ > /dev/null; do
  printf "."
  sleep 2
done
echo " ✓ Elasticsearch is up"

# 2) Register snapshot repository
echo "🗄️  Registering snapshot repository 'my_fs_backup'…"
curl -s -X PUT "https://elasticsearch:9200/_snapshot/my_fs_backup" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  --cacert /usr/share/kibana/config/certs/ca.crt \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backup",
      "compress": true
    }
  }' \
  && echo " ✓ Repository created" \
  || echo " ℹ️  Repository may already exist, continuing…"

# … after registering snapshot repository …

# 𝄞 Install ILM policy
echo "🔧 Installing ILM policy 'logs_retention'…"
curl -s -X PUT "https://elasticsearch:9200/_ilm/policy/logs_retention" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  --cacert /usr/share/kibana/config/certs/ca.crt \
  -H "Content-Type: application/json" \
  -d @/usr/share/kibana/config/ilm_policy.json \
  && echo " ✓ logs_retention policy created" \
  || echo " ℹ️ logs_retention already exists, skipping…"

# … then set kibana_system password & launch Kibana as before


# 3) Set kibana_system password
echo "🔐 Setting kibana_system password…"
curl -s -X POST "https://elasticsearch:9200/_security/user/kibana_system/_password" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  --cacert /usr/share/kibana/config/certs/ca.crt \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"${ELASTIC_PASSWORD}\"}" \
  && echo " ✓ kibana_system password set"

# 4) Launch Kibana
echo "🚀 Launching Kibana…"
exec /usr/local/bin/kibana-docker
