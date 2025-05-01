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

Delete
  Goal: Garbage-collect old data.
  Action: Elasticsearch drops the entire index once it’s aged out (90 days in your policy).


  "logs_retention" : {
    "version" : 1,
    "modified_date" : "2025-05-01T19:38:27.391Z",
    "policy" : {
      "phases" : {
        "warm" : {
          "min_age" : "7d",
          "actions" : {
            "allocate" : {
              "include" : { },
              "exclude" : { },
              "require" : {
                "data" : "warm"
              }
            },
            "shrink" : {
              "number_of_shards" : 1
            }
          }
        },
        "cold" : {
          "min_age" : "30d",
          "actions" : {
            "freeze" : { }
          }
        },
        "hot" : {
          "min_age" : "0ms",
          "actions" : {
            "rollover" : {
              "max_age" : "1d",
              "max_size" : "30gb"
            }
          }
        },
        "delete" : {
          "min_age" : "90d",
          "actions" : {
            "delete" : {
              "delete_searchable_snapshot" : true
            }
          }
        }
      }
    },
    "in_use_by" : {
      "indices" : [
        ".ds-filebeat-8.12.1-2025.05.01-000001"
      ],
      "data_streams" : [
        "filebeat-8.12.1"
      ],
      "composable_templates" : [
        "filebeat-8.12.1"
      ]
    }
  }

backup exist:

curl -u elastic:changeme   --cacert ./certs/ca.crt   https://localhost:9200/_slm/policy/weekly-snapshots?pretty

logs are saved in elk/elasticsearch/backup

  Policy name: weekly-snapshots (version 1).
  What it does: Takes a full snapshot of every index ("indices": ["*"]) every Sunday at 01:30 UTC (that’s 03:30 CEST in Paris).
  Snapshot naming: Each run produces a snapshot named like snapshot-YYYY.MM.DD (e.g. snapshot-2025.05.04).
  Retention rules:
      Snapshots older than 30 days are automatically deleted.
      Always keep at least 5 snapshots, and never keep more than 50.
  Next run: Scheduled for May 4, 2025 at 01:30 UTC (next_execution_millis).
  Stats: All zeros right now because the policy hasn’t executed yet.

  {
    "weekly-snapshots" : {
      "version" : 1,
      "modified_date_millis" : 1746129343711,
      "policy" : {
        "name" : "<snapshot-{now/d}>",
        "schedule" : "0 30 1 ? * SUN",
        "repository" : "my_fs_backup",
        "config" : {
          "indices" : [
            "*"
          ],
          "ignore_unavailable" : true,
          "include_global_state" : false
        },
        "retention" : {
          "expire_after" : "30d",
          "min_count" : 5,
          "max_count" : 50
        }
      },
      "next_execution_millis" : 1746322200000,
      "stats" : {
        "policy" : "weekly-snapshots",
        "snapshots_taken" : 0,
        "snapshots_failed" : 0,
        "snapshots_deleted" : 0,
        "snapshot_deletion_failures" : 0
      }
    }
  }

trigger a backup:
  curl -u elastic:changeme \
    --cacert ./certs/ca.crt \
    -X PUT "https://localhost:9200/_snapshot/my_fs_backup/manual-test-$(date +%Y.%m.%d)?wait_for_completion=true"
