import { LogEntry, LogLevel, LogType } from "./normalization.js";

export function createLogEntry(level: LogLevel, type: LogType, message: string): LogEntry {
    return {
        service: "backend",
        level,
        type,
        message,
        timestamp: new Date().toISOString(),
    };
}
