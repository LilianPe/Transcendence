import { logToELK } from "../logger/logToElk.js";
import { LogLevel, LogType } from "../logger/normalization.js";
import { Player } from "../Pong/Player.js";
import { app, game, registeredClients } from "../server.js";

function handleGetApi(): void {
	app.get("/game/state", async (req, reply) => {
		logToELK({
			level: LogLevel.INFO,
			message: "Serving game state from API",
			service: "backend",
			type: LogType.REQUEST,
			timestamp: new Date().toISOString(),
		});
		return game.getState();
	});
}

function handlePostApi(): void {
	app.post("/game/controls", async (req, reply) => {
		logToELK({
			level: LogLevel.INFO,
			message: "request post at /game/controls",
			service: "backend",
			type: LogType.REQUEST,
			timestamp: new Date().toISOString(),
		});
		
		const { playerId, direction } = req.body as { playerId: string; direction: "up" | "down" };

		if (!playerId || !direction) {
			return reply.status(400).send({ error: "Missing playerId or direction" });
		}

		const player: Player | undefined = registeredClients.get(playerId)?.player;

		if (!player) {
			return reply.status(400).send({ error: "Player " + playerId + " isn't registered." });
		}
		if (game.getState().player1Id != playerId && game.getState().player2Id != playerId) {
			return reply.status(400).send({ error: "Player " + playerId + " isn't registered." });
		}
		// recuperer registered client de id, regarder si il existe et si ij joue, si oui, bouger + return sucess, sinon return erreur;
		//game.update();
	});

}

export function handleApiRequest(): void {
	handleGetApi();
	handlePostApi();
}
