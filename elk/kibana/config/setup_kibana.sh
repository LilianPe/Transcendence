#!/usr/bin/env bash
set -e

echo "⏳ Waiting for Elasticsearch to come up…"
# use the Kibana-mounted cert path
until curl -s -u elastic:${ELASTIC_PASSWORD} \
    --cacert /usr/share/kibana/config/certs/ca.crt \
    https://elasticsearch:9200 > /dev/null 2>&1; do
  printf "."
  sleep 2
done
echo

echo "🔐 Setting kibana_system password…"
curl -s -X POST -u elastic:${ELASTIC_PASSWORD} \
  --cacert /usr/share/kibana/config/certs/ca.crt \
  -H "Content-Type: application/json" \
  https://elasticsearch:9200/_security/user/kibana_system/_password \
  -d "{\"password\":\"${ELASTIC_PASSWORD}\"}"

echo "🚀 Launching Kibana…"
/usr/local/bin/kibana-docker
