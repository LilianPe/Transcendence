import { FastifyInstance } from "fastify";
import { logToELK } from "../logger/logToElk";
import { LogLevel, LogType } from "../logger/normalization";

export function registerDebugEndpoint(app: FastifyInstance)
{
    app.get("/", async (req, reply) => {
        logToELK({
            level: LogLevel.INFO,
            message: "Hello",
            service: "backend",
            type: LogType.REQUEST,
            timestamp: new Date().toISOString(),
        });
        return { hello: "world" };
    });
    
}