import cors from "@fastify/cors";
import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { createLogEntry } from "./logger/logHelper.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import fastifyWebsocket, { FastifyRequest, SocketStream } from "@fastify/websocket";
import { GameState } from "./Pong/Game.js";
import { Player } from "./Pong/Player.js";
import { ServerSidePong } from "./Pong/ServerSidePong.js";
import { createUser } from './Database/requests.js';

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

app.register(cors, {
    origin: "http://localhost:3000",
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "X-Client-Id"],
});

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

export interface Client {
	player: Player;
	socketStream: SocketStream;
}

const clients: Map<string, Client> = new Map();
const registeredClients: Map<string, Client> = new Map();

app.register(fastifyWebsocket, { options: { perMessageDeflate: true } });
app.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (socket: SocketStream, req: FastifyRequest) => {
        logToELK(createLogEntry(LogLevel.INFO, LogType.REQUEST, "🔌 WS Connected from " + req.ip));
        const clientID: string = crypto.randomUUID();
		const client: Client = {
			player: new Player(clientID),
			socketStream: socket
		}
        clients.set(clientID, client);
		socket.send(JSON.stringify({type: "clientId", clientId: clientID}));
        // console.log("Nouveau client connecte, ID: " + clientID);

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
            game.update(message.toString(), clients, registeredClients, clientID);
        });

        // Gérer les erreurs
        socket.on("error", (err: Buffer) => {
            logToELK(createLogEntry(LogLevel.ERROR, LogType.RESPONSE, "💥 WS error: " + err));
            console.error("Erreur WebSocket:", err);
        });

        // Envoi des données du jeu au client

        const interval = setInterval(() => {
            const state: GameState = game.getState();
            socket.send(JSON.stringify({type: "state", state: state}));
        }, 1000 / 30);

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
			if (registeredClients.get(clientID)) registeredClients.delete(clientID);
            clients.delete(clientID);
            console.log("Client déconnecté, code:", code, "raison:", reason.toString());
            clearInterval(interval);
        });
    });
});

// Inscriptions

app.post("/register", async (request, reply) => {
    const username: string = (request.body as { username: string }).username;
	const id: string = request.headers["x-client-id"] as string;

	console.log(`new registration request: ${username}`)
    if (!username) {
        return reply.status(400).send({message: "Username can't be blank"});
    }
	const client = clients.get(id);
	if (client) {
		client.player.register(username);
		console.log(`Nouvel utilisateur enregistre: Id: ${id}, Name: ${username}`);
		registeredClients.set(id, client);
		reply.send({message: `Inscription reussie pour ${username}`})
	}
	else {
		reply.status(500).send({message: "Internal Error"});
	}
});

// server

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
