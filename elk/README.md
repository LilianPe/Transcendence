📊 Kibana & ELK Stack — Log Management Summary
✅ 1. Kibana Setup

    Kibana URL: http://localhost:5601

    Elasticsearch is automatically detected via Docker at http://localhost:9200.

📁 2. Create a Data View

To view logs sent by your backend:

    In Kibana, go to Management → Stack Management → Data Views

    Click “Create data view”

    Fill out the form:

        Name: backend-logs

        Index pattern: backend-logs*

        Timestamp field: @timestamp

    Click Create data view

🔎 3. View Logs in Discover

    In the Kibana sidebar, go to “Discover”

    Select the backend-logs data view

    Logs will appear sorted by @timestamp

    You can apply filters, search fields, or adjust the time range (top right)

🧹 4. Clear All Logs (Reset Logs)

To remove all log data from Elasticsearch:

    Go to Management → Stack Management → Index Management

    In the list of indices, search for:

        backend-logs-*

    Select the matching indices using checkboxes

    Click “Delete index” at the top

    Confirm deletion

    🔄 You can now start sending logs again and they’ll appear fresh in the data view.