import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { logToELK } from "./logger/logToElk.js";
import fastifyWebsocket from "@fastify/websocket";
import { Player, ServerSidePong } from "./serverSidePong.js";
import { registerDebugEndpoint } from "./endpoint/debug.js";


// Fastify
const app: FastifyInstance = fastify();
app.register(fastifyWebsocket);

// ELK
registerHooks(app);

// ENDPOINT
registerDebugEndpoint(app);

const start = async () => {
    try {
        await app.listen({ port: 4500, host: "0.0.0.0" });
        console.log("🚀 Backend server running on http://localhost:4500");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
