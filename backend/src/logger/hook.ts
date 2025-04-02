import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { logToELK } from "./logToElk.js";
import { LogEntry, LogLevel, LogType } from "./normalization.js";
import { getLogEntryInfoRequest, getLogEntryInfoResponse } from "./logHelper.js";

export function registerHooks(app: FastifyInstance) {
    app.addHook("onRequest", async (req: FastifyRequest) => {
            const entry: LogEntry = getLogEntryInfoRequest(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`)
            logToELK(entry);
        });

    app.addHook("onResponse", async (req: FastifyRequest, res: FastifyReply) => {
        const entry: LogEntry = getLogEntryInfoResponse(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`)
        logToELK(entry);
    });
}
