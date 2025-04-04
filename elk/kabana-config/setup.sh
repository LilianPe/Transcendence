#!/bin/bash

echo "🚀 Starting Kibana in background..."
/usr/local/bin/kibana-docker &

echo "⏳ Waiting for Kibana API..."
until curl -s http://localhost:5601/api/status | grep -q "overall"; do
  echo "🔄 Still waiting for Kibana API..."
  sleep 2
done

echo "✅ Kibana is ready!"

# Example: Import saved objects (dashboards, etc.)
echo "📦 Importing saved objects..."
curl -X POST http://localhost:5601/api/saved_objects/_import \
  -H "kbn-xsrf: true" \
  -F file=@/usr/local/bin/dashboards/kibana_basic.ndjson

echo "✅ Done importing saved objects."

# 🧠 Don't exit the script or container stops!
echo "📡 Kibana is running..."
wait -n
