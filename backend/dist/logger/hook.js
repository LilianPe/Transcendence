import { logToELK } from "./logToElk.js";
import { LogLevel, LogType } from "./normalization.js";
import { createLogEntry } from "./logHelper.js";
export function registerHooks(app) {
    app.addHook("onRequest", async (req) => {
        const entry = createLogEntry(LogLevel.INFO, LogType.REQUEST, `${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`);
        logToELK(entry);
    });
    app.addHook("onResponse", async (req, res) => {
        const entry = createLogEntry(LogLevel.INFO, LogType.RESPONSE, `${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`);
        logToELK(entry);
    });
    app.addHook("onError", async (req, reply, error) => {
        const entry = createLogEntry(LogLevel.ERROR, LogType.RESPONSE, `${req.method} ${req.url} - ${error.message}`);
        logToELK(entry);
    });
}
