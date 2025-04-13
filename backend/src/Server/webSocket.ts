import { createLogEntry } from "../logger/logHelper.js";
import { logToELK } from "../logger/logToElk.js";
import { LogLevel, LogType } from "../logger/normalization.js";
// @ts-ignore
import fastifyWebsocket, { FastifyRequest, SocketStream } from "@fastify/websocket";
import { GameState } from "../Pong/Game.js";
import { Player } from "../Pong/Player.js";
import { app, clients, game, registeredClients } from "../server.js";

export interface Client {
	player: Player;
	socketStream: SocketStream;
}

export const registeredTournament: Map<string, Player> = new Map();

function registerToTournament(id: string): void {
	const client: Client | undefined = registeredClients.get(id);
	if (client) {
		if (registeredTournament.get(id)) {
			clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "You are already registered."}));
		}
		else {
			const player: Player = client.player;
			registeredTournament.set(id, player);
			// player.register pour set le name a recuperer dans la database
		}
	}
	else {
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "You must be registered."}));
	}
}

function launchTournament(id: string): void {
	if (game.getTournament().isLaunched()) {
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "A tournament is already launched."}));
	}
	else if (registeredTournament.size < 2) {
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "Not enought player in tournament to launch."}));
	}
	else {
		game.launchTournament(registeredTournament);
	}
}

export function handleWebsocket(): void {
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
			socket.on("message", (message: Buffer | string): void => {
				logToELK(
					createLogEntry(
						LogLevel.DEBUG,
						LogType.REQUEST,
						"📨 WS message: " + message.toString()
					)
				);
				console.log("Message reçu du client " + clientID + ": ", message.toString());
				if (message == "register") {
					registerToTournament(clientID);
				}
				if (message == "launch tournament") {
					launchTournament(clientID);
				}
				game.update(message.toString(), clients, registeredTournament, clientID);
			});

			// Gérer les erreurs
			socket.on("error", (err: Buffer): void => {
				logToELK(createLogEntry(LogLevel.ERROR, LogType.RESPONSE, "💥 WS error: " + err));
				console.error("Erreur WebSocket:", err);
			});

			// Envoi des données du jeu au client

			const interval: NodeJS.Timeout = setInterval((): void => {
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
}