import fastify from "fastify";
import { registerHooks } from "./logger/hook.js";
import fastifyWebsocket from "@fastify/websocket";
import { registerDebugEndpoint } from "./endpoint/debug.js";
// Fastify
const app = fastify();
app.register(fastifyWebsocket);
// ELK
registerHooks(app);
// ENDPOINT
registerDebugEndpoint(app);
const start = async () => {
    try {
        await app.listen({ port: 4500, host: "0.0.0.0" });
        console.log("🚀 Backend server running on http://localhost:4500");
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
