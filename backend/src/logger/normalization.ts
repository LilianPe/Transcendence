export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export enum LogType {
  REQUEST = "request",
  RESPONSE = "response"
}

export interface LogEntry {
  service: string; // frontend or backend
  level: LogLevel;
  type: LogType
  message: string;
  timestamp?: string;
}