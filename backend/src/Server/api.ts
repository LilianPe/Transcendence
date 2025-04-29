import { logToELK } from "../logger/logToElk.js";
import { LogLevel, LogType } from "../logger/normalization.js";
import { Match } from "../Pong/Match.js";
import { Player } from "../Pong/Player.js";
import { Ref } from "../Pong/Tournament.js";
import { app, clients, game, registeredClients } from "../server.js";
import { a_game_is_already_running, Client, registeredTournament } from "./webSocket.js";
// import * as SC from "../Blockchain/SC_interact.js";

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

// A refaire selon le systeme de tournois
function handleGameInit() {
	app.post("/game/init/game", async (req, reply) => {
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

function handleTournamentInit() {
	app.post("/game/init/tournament", async (req, reply) => {
		if (game.getTournament().isLaunched()) {
			return reply.status(409).send({type: "error", error: "A tournament is already launched."});	
		}
		else if (registeredTournament.size < 2) {
			return reply.status(400).send({type: "error", error: "Not enought player in tournament to launch."});	
		}
		if (a_game_is_already_running())
		{
			return reply.status(400).send({type: "error", error: "Wait for the game to end."});
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
	// handleBlockchain();
}

export function handleApiRequest(): void {
	handleGetApi();
	handlePostApi();
}



// blockchain

// function handleBlockchain(): void
// {
// 	app.post("/blockchain", async (req, reply) =>
// 		{
// 			logToELK({
// 				level: LogLevel.INFO,
// 				message: "request post at /blockchain",
// 				service: "backend",
// 				type: LogType.REQUEST,
// 				timestamp: new Date().toISOString(),
// 		});
		
// 		const { tournamentid } = req.body as { tournamentid: number; };

// 		if (!tournamentid)
// 		{
// 			return reply.status(400).send({ error: "Missing tournamentid" });	
// 		}

// 		return {message: SC.getStatusInBlockchain( tournamentid )}
// 	});
// }
