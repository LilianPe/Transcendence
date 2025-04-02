import fastify from "fastify";
import { logToELK } from "./logger.js";
const app = fastify();
app.get("/", async (req, reply) => {
    logToELK({
        message: "GET / received",
        route: "/",
        method: "GET"
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
