import { LogEntry } from "./normalization";

export function logToELK(entry: LogEntry) {
  fetch("http://logstash:5000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...entry,
    }),
  }).catch((err) => {
    console.error("❌ Failed to send log to ELK:", err.message);
  });
}
