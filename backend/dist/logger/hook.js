import { logToELK } from "./logToElk.js";
import { getLogEntryInfoRequest, getLogEntryInfoResponse } from "./logHelper.js";
export function registerHooks(app) {
    app.addHook("onRequest", async (req) => {
        const entry = getLogEntryInfoRequest(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`);
        logToELK(entry);
    });
    app.addHook("onResponse", async (req, res) => {
        const entry = getLogEntryInfoResponse(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`);
        logToELK(entry);
    });
}
