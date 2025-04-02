import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { logToELK } from "./logToElk.js";
import { LogEntry, LogLevel, LogType } from "./normalization.js";
import { createLogEntry } from "./logHelper.js";

export function registerHooks(app: FastifyInstance) {
    app.addHook("onRequest", async (req: FastifyRequest) => {
        const entry: LogEntry = createLogEntry(
            LogLevel.INFO,
            LogType.REQUEST,
            `${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`
        );
        logToELK(entry);
    });

    app.addHook("onResponse", async (req: FastifyRequest, res: FastifyReply) => {
        const entry: LogEntry = createLogEntry(
            LogLevel.INFO,
            LogType.RESPONSE,
            `${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ""}`
        );
        logToELK(entry);
    });

    app.addHook("onError", async (req, reply, error) => {
        const entry: LogEntry = createLogEntry(
          LogLevel.ERROR,
          LogType.RESPONSE,
          `${req.method} ${req.url} - ${error.message}`
        );
        logToELK(entry);
      });
}
