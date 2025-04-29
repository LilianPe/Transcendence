export function logToELK(entry) {
    fetch("https://logstash:5000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    }).catch((err) => {
        console.error("❌ Failed to send log to ELK:", err.message);
    });
}
