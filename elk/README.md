Policy exists

curl -u elastic:changeme --cacert certs/ca.crt \
  https://localhost:9200/_ilm/policy/logs_retention?pretty

policy.phases:  
  Defines the four stages of the retention lifecycle:

Hot
  What it is: The “active” index that’s receiving all your new writes.
  When rollover happens: As soon as it hits 1 day old or 30 GB, ILM automatically rolls it over—i.e. creates a new hot index (e.g. backend-logs-000002) and switches your alias (backend-logs) to point at that new one.

Warm
  Goal: Reduce resource footprint while still keeping the index searchable.
  Actions: shrink to fewer shards, move shards onto less-expensive “warm” nodes, maybe reduce replicas. It’s still online and queryable, just more compact.

Cold
  Goal: Long-term retention at minimal cost.
  Actions: freeze the index (read-only, in-memory structures released), so you can still search it but queries may be slower.

Frozen
  save the snapshot in ./backup

Delete
  Goal: Garbage-collect old data.
  Action: Elasticsearch drops the entire index once it’s aged out (60 days in your policy).

{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_age": "1d", "max_size": "30gb" }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": { "require": { "data": "warm" } },
          "shrink":    { "number_of_shards": 1 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {}
        }
      },
      "frozen": {
        "min_age": "60d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "my_fs_backup",
            "force_merge_index": false
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}


backup:
manualy create a backup that should normaly be triggered at 60 day (delete phase)

curl -u elastic:changeme \
  --cacert certs/ca.crt \
  -X PUT "https://localhost:9200/_snapshot/my_fs_backup/test-manual-$(date +%Y%m%d)"?wait_for_completion=true \
  -H "Content-Type: application/json" -d'
{
  "indices":   "filebeat-8.12.1-2025.05.01-000001",
  "ignore_unavailable": true,
  "include_global_state": false
}'

logs are savec in elk/elasticsearch/backup