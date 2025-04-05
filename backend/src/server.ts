import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { createLogEntry } from "./logger/logHelper.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import fastifyWebsocket, { FastifyRequest, SocketStream } from "@fastify/websocket";
import { GameState } from "./Pong/Game.js";
import { ServerSidePong } from "./Pong/ServerSidePong.js";

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const options = {
//     https: {
//         key: fs.readFileSync(path.join(__dirname, "../certs/localhost+2-key.pem")),
//         cert: fs.readFileSync(path.join(__dirname, "../certs/localhost+2.pem")),
//     },
// };

const app: FastifyInstance = fastify(/*options*/);
// ELK

registerHooks(app);

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

// Fastify websocket
const game = new ServerSidePong();
const clients: Map<string, SocketStream> = new Map();

app.register(fastifyWebsocket);
app.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (socket: SocketStream, req: FastifyRequest) => {
        logToELK(createLogEntry(LogLevel.INFO, LogType.REQUEST, "🔌 WS Connected from " + req.ip));
        const clientID: string = crypto.randomUUID();
        clients.set(clientID, socket);
        console.log("Nouveau client connecte, ID: " + clientID);

        // debug websocket
        socket.on("message", (message: Buffer | string) => {
            logToELK(
                createLogEntry(
                    LogLevel.DEBUG,
                    LogType.REQUEST,
                    "📨 WS message: " + message.toString()
                )
            );
            console.log("Message reçu du client " + clientID + ": ", message.toString());
            game.update(message.toString(), clients, clientID);
        });

        // Gérer les erreurs
        socket.on("error", (err: Buffer) => {
            logToELK(createLogEntry(LogLevel.ERROR, LogType.RESPONSE, "💥 WS error: " + err));
            console.error("Erreur WebSocket:", err);
        });

        // Envoi des données du jeu au client

        const interval = setInterval(() => {
            const state: GameState = game.getState();
            socket.send(JSON.stringify(state));
        }, 1000 / 60);

        // Gérer la fermeture de la connexion WebSocket
        socket.on("close", (code: number, reason: Buffer) => {
            logToELK(
                createLogEntry(
                    LogLevel.INFO,
                    LogType.RESPONSE,
                    "👋 WS connection closed. code:" + code + ", reason:" + reason.toString()
                )
            );
            game.check(clients, clientID);
            clients.delete(clientID);
            console.log("Client déconnecté, code:", code, "raison:", reason.toString());
            clearInterval(interval);
        });
    });
});

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
