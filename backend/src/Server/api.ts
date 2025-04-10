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

function handlePlayerMoves(): void {
	app.post("/game/controls", async (req, reply) => {
		logToELK({
			level: LogLevel.INFO,
			message: "request post at /game/controls",
			service: "backend",
			type: LogType.REQUEST,
			timestamp: new Date().toISOString(),
		});
		
		const { playerId, direction } = req.body as { playerId: string; direction: string };

		if (!playerId || !direction) {
			return reply.status(400).send({ error: "Missing playerId or direction" });
		}

		if (direction.toLowerCase() != "up" && direction.toLowerCase() != "down") {
			return reply.status(400).send({ error: "Direction unrecognized" });

		}

		const player: Player | undefined = registeredClients.get(playerId)?.player;

		if (!player) {
			return reply.status(400).send({ error: `Player ${playerId} isn't registered.` });
		}
		if (game.getState().player1Id != playerId && game.getState().player2Id != playerId) {
			return reply.status(400).send({ error: `Player ${playerId} isn't playing.` });
		}
		switch (direction.toLocaleLowerCase()) {
			case "up" :
				player.moveUp();
				break;
			case "down" :
				player.moveDown();
				break;
		}
		return {message: `Player ${playerId} moved ${direction}.`}
	});
}

function handleGameInit() {
	app.post("/game/init", async (req, reply) => {
        if (game.getGame().getRound().isRunning()) return reply.status(400).send({type: "error", error: "A game is already running."});
        else if (registeredClients.size < 2) return reply.status(400).send({type: "error", error: "Not enought player registered to launch."});
		else {
        	const clientKeys: Array<string> = Array.from(registeredClients.keys());
            const player1: Player | undefined = registeredClients.get(clientKeys[0])?.player;
            const player2: Player | undefined = registeredClients.get(clientKeys[1])?.player;

            if (player1 && player2) {
                game.launchGame(player1, player2);
            } else {
                return reply.status(400).send({ type: "error", error: "Erreur lors de la récupération des joueurs." });
            }
        }
	})
}

function handlePostApi(): void {
	handlePlayerMoves();
	handleGameInit();
}

export function handleApiRequest(): void {
	handleGetApi();
	handlePostApi();
}
