import { logToELK } from "../logger/logToElk.js";
import { LogLevel, LogType } from "../logger/normalization.js";
import { Match } from "../Pong/Match.js";
import { Player } from "../Pong/Player.js";
import { Ref } from "../Pong/Tournament.js";
import { app, clients, game, registeredClients } from "../server.js";
import { registeredTournament } from "./webSocket.js";
import * as SC from "../Blockchain/SC_interact.js";

function isCorrectId(id :string): boolean {
	if (clients.get(id)) {
		return true;
	}
	return false;
}

function handleGetApi(): void {
	app.get("/game/state", async (req, reply) => {
		logToELK({
			level: LogLevel.INFO,
			message: "Serving game state from API",
			service: "backend",
			type: LogType.REQUEST,
			timestamp: new Date().toISOString(),
		});
		const userpass: string | string[] | undefined = req.headers['x-api-password'];
		if (!userpass) {
			return reply.status(403).send({type: "error", error:`Access denied, missing password in header x-api-password.`});
		}
		if (Array.isArray(userpass)) {
			return reply.status(400).send({type: "error", error:`Access denied, please enter only 1 password.`});
		}
		if (!isCorrectId(userpass)) {
			return reply.status(403).send({type: "error", error:`Access denied.`});
		  }
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
		const userpass: string | string[] | undefined = req.headers['x-api-password'];
		if (!userpass) {
			return reply.status(403).send({type: "error", error:`Access denied, missing password in header x-api-password.`});
		}
		if (Array.isArray(userpass)) {
			return reply.status(400).send({type: "error", error:`Access denied, please enter only 1 password.`});
		}
		if (!isCorrectId(userpass)) {
			return reply.status(403).send({type: "error", error:`Access denied.`});
		  }
		
		if (!req.body) {
			return reply.status(400).send({ error: "Missing playerId and direction" });
		}

		const { playerId, direction }: { playerId: string; direction: string } = req.body as { playerId: string; direction: string };

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

// A refaire selon le systeme de tournois
function handleGameInit(): void {
	app.post("/game/init/game", async (req, reply) => {
		const userpass: string | string[] | undefined = req.headers['x-api-password'];
		if (!userpass) {
			return reply.status(403).send({type: "error", error:`Access denied, missing password in header x-api-password.`});
		}
		if (Array.isArray(userpass)) {
			return reply.status(400).send({type: "error", error:`Access denied, please enter only 1 password.`});
		}
		if (!isCorrectId(userpass)) {
			return reply.status(403).send({type: "error", error:`Access denied.`});
		  }
        if (game.getGame().getRound().isRunning()) return reply.status(409).send({type: "error", error: "A game is already running."});
        else if (!game.getTournament().isLaunched()) return reply.status(400).send({type: "error", error: "No tournament launched."});
        else if (registeredTournament.size < 2) return reply.status(400).send({type: "error", error: "Not enought player registered to tournament."});
		else {
			const match: Ref<Match> | undefined = game.getTournament().getNextMatch();
			if (match) {
				game.launchGame(match);
			}
			else {
				return reply.status(400).send({type: "error", error: "Matchmaking error."});	
			}
        	game.update("start", clients, registeredTournament, "");
			return reply.status(201).send({ message: "Game launched." });
		}
	})
}

function handleTournamentInit(): void {
	app.post("/game/init/tournament", async (req, reply) => {
		
		const userpass: string | string[] | undefined = req.headers['x-api-password'];
		if (!userpass) {
			return reply.status(403).send({type: "error", error:`Access denied, missing password in header x-api-password.`});
		}
		if (Array.isArray(userpass)) {
			return reply.status(400).send({type: "error", error:`Access denied, please enter only 1 password.`});
		}
		if (!isCorrectId(userpass)) {
			return reply.status(403).send({type: "error", error:`Access denied.`});
		  }
		if (game.getTournament().isLaunched()) {
			return reply.status(409).send({type: "error", error: "A tournament is already launched."});	
		}
		else if (registeredTournament.size < 2) {
			return reply.status(400).send({type: "error", error: "Not enought player in tournament to launch."});	
		}
		else {
			game.launchTournament(registeredTournament);
			return reply.status(201).send({ message: "Tournament launched." });
		}
	})
}

function handlePostApi(): void {
	handlePlayerMoves();
	handleGameInit();
	handleTournamentInit();
	handleBlockchain();
}

export function handleApiRequest(): void {
	handleGetApi();
	handlePostApi();
}



// blockchain

function handleBlockchain(): void
{
	app.post("/blockchain", async (req, reply) =>
		{
			logToELK({
				level: LogLevel.INFO,
				message: "request post at /blockchain",
				service: "backend",
				type: LogType.REQUEST,
				timestamp: new Date().toISOString(),
		});

		const userpass: string | string[] | undefined = req.headers['x-api-password'];
		if (!userpass) {
			return reply.status(403).send({type: "error", error:`Access denied, missing password in header x-api-password.`});
		}
		if (Array.isArray(userpass)) {
			return reply.status(400).send({type: "error", error:`Access denied, please enter only 1 password.`});
		}
		if (!isCorrectId(userpass)) {
			return reply.status(403).send({type: "error", error:`Access denied.`});
		}

		const { tournamentid } = req.body as { tournamentid: string; };

		const tournamentIdNum = parseInt(tournamentid, 10);

		if (isNaN(tournamentIdNum)) {
			return reply.status(400).send({ error: "Invalid tournamentid" });
		}

		if (tournamentIdNum >= 0)
			return { message: SC.getStatusInBlockchain(tournamentIdNum) };
		else
			return reply.status(400).send({ error: "Invalid tournamentid" });
	});
}


