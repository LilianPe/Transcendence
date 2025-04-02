import { LogEntry, LogLevel, LogType } from "./normalization.js"

export function getLogEntryInfoRequest(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.INFO,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}

export function getLogEntryInfoResponse(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.INFO,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}

export function getLogEntryDebugRequest(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.DEBUG,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}

export function getLogEntryDebugResponse(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.DEBUG,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}

export function getLogEntryErrorRequest(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.ERROR,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}

export function getLogEntryErrorResponse(message: string): LogEntry
{
    const entry: LogEntry = {
        service: "backend",
        level: LogLevel.ERROR,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    }
    return entry;
}