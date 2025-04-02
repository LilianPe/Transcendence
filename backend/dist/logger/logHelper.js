import { LogLevel, LogType } from "./normalization.js";
export function getLogEntryInfoRequest(message) {
    const entry = {
        service: "backend",
        level: LogLevel.INFO,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
export function getLogEntryInfoResponse(message) {
    const entry = {
        service: "backend",
        level: LogLevel.INFO,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
export function getLogEntryDebugRequest(message) {
    const entry = {
        service: "backend",
        level: LogLevel.DEBUG,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
export function getLogEntryDebugResponse(message) {
    const entry = {
        service: "backend",
        level: LogLevel.DEBUG,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
export function getLogEntryErrorRequest(message) {
    const entry = {
        service: "backend",
        level: LogLevel.ERROR,
        type: LogType.REQUEST,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
export function getLogEntryErrorResponse(message) {
    const entry = {
        service: "backend",
        level: LogLevel.ERROR,
        type: LogType.RESPONSE,
        message: message,
        timestamp: new Date().toISOString()
    };
    return entry;
}
