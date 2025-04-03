import fastify from "fastify";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Pour remplacer __dirname
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import fastifyWebsocket from "@fastify/websocket";
import { Player, ServerSidePong } from "./serverSidePong.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https
const options = {
    https: {
        cert: fs.readFileSync(path.join(__dirname, "../certs/fullchain.pem")),
        key: fs.readFileSync(path.join(__dirname, "../certs/privkey.pem")),
    },
};
const app = fastify(options);
// Fastify websocket
app.register(fastifyWebsocket);
app.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (socket, req) => {
        console.log("Un client tente de se connecter...");
        // debug websocket
        socket.on("message", (message) => {
            console.log("Message reçu du client: ", message.toString());
            // socket.send("Hello from server!");
        });
        // Gérer les erreurs
        socket.on("error", (err) => {
            console.error("Erreur WebSocket:", err);
        });
        // Envoi des données du jeu au client
        console.log("connection");
        const interval = setInterval(() => {
            const state = {
                ballX: game.getGame().getBall().getX(),
                ballY: game.getGame().getBall().getY(),
            };
            socket.send(JSON.stringify(state));
        }, 1000 / 60);
        // Gérer la fermeture de la connexion WebSocket
        socket.on("close", (code, reason) => {
            console.log("Client déconnecté, code:", code, "raison:", reason.toString());
            clearInterval(interval);
        });
    });
});
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
const game = new ServerSidePong();
start();
function startGame() {
    game.launchGame(new Player("Player1"), new Player("Player2"));
    console.log("Game is runing!");
}
startGame();
