import http from "http";

export function logToELK(data: Record<string, any>) {
  fetch("http://logstash:5000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "backend",
      level: "info",
      message: "✨ Hello from backend",
      "@timestamp": new Date().toISOString(),
      ...data,
    }),
  }).catch(err => {
    console.error("ELK log error:", err.message);
  });
}
