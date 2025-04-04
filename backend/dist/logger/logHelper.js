export function createLogEntry(level, type, message) {
    return {
        service: "backend",
        level,
        type,
        message,
        timestamp: new Date().toISOString(),
    };
}
