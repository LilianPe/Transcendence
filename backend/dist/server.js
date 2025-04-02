import fastify from "fastify";
import { logToELK } from "./logger/logToElk.js";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
const app = fastify();
registerHooks(app);
app.get("/", async (req, reply) => {
    logToELK({
        level: LogLevel.INFO,
        message: "Hello",
        service: "backend",
        type: LogType.REQUEST,
        timestamp: new Date().toISOString()
    });
    return { hello: "world" };
});
const start = async () => {
    try {
        await app.listen({ port: 4500, host: "0.0.0.0" });
        console.log("🚀 Backend running on http://localhost:4500");
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
