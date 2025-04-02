export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
export var LogType;
(function (LogType) {
    LogType["REQUEST"] = "request";
    LogType["RESPONSE"] = "response";
})(LogType || (LogType = {}));
