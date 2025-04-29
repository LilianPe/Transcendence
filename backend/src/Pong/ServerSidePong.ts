// @ts-ignore
import { Client, clients, registeredClients } from "../server.js";
import { Game, GameState } from "./Game.js";
import { Match } from "./Match.js";
import { Player } from "./Player.js";
import { Ref, Tournament } from "./Tournament.js";

import * as SC from "../Blockchain/SC_interact.js";
// import { getUserFromDB } from "../Database/requests.js"

export class ServerSidePong {
    private game: Game;
    private running: number;
	private soloMatchRunning: boolean;
	private tournament: Tournament;

    constructor() {
		this.soloMatchRunning = false;
        this.running = 0;
		this.tournament = new Tournament(undefined);
		this.game = new Game(new Player(""), new Player(""));
    }
    public launchGame(match: Ref<Match>): void {
        // console.log(`New game launched, Player1: ${player1.getName()}, Player2: ${player2.getName()}`)
		this.game = new Game(match.value.getPlayer1(), match.value.getPlayer2());
        this.running = 1;
        this.game.launch(match);
    }
    public update(message: string, clients: Map<string, Client>, registeredTournament: Map<string, Player>, clientID: string): void {
        this.game.update(message, clients, clientID);
        
		console.log(message);
		if (message == "start") {
			console.log("debug");
			if (!clients.get(clientID)?.player.isRegistered()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "You are not registered."}));
            else if (this.game.getRound().isRunning()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "A game is already running."}));
            else if (!this.tournament.isLaunched()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "No tournament launched."}));
				else {
					console.log("Game launched");
					// this.tournament.createNextRound();
					const match: Ref<Match> | undefined = this.tournament.getNextMatch();
					if (match) {
						// console.log(`Player1: ${match.value.getPlayer1().getId()} | Player2: ${match.value.getPlayer2().getId()}`)			
						this.launchGame(match);
						this.launchSolo();
					}
					else {
						clients.forEach((value: Client, key: string) => {
							value.webSocket.send(JSON.stringify({type: "error", error: "Matchmaking error."}));
						});
					}
            }
        }
    }

	private notifyDisconection(clientID: string): void {
		const disconected: Player | undefined = registeredClients.get(clientID)?.player;
		if (!disconected) return;
		disconected.disconect();
		clients.forEach((value: Client, key: string) => {
			value.socketStream.send(JSON.stringify({type: "error", error: `${disconected.getName()} disconected.`}));
		});
	}

    public check(clients: Map<string, Client>, clientID: string): void {
		this.notifyDisconection(clientID);
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop(clientID);
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop(clientID);
        }
		this.tournament.removePlayerFromTournament(clientID);
    }

	private sendNextMatch(match: Match) {
		clients.forEach((value: Client, key: string) => {
			value.socketStream.send(JSON.stringify({type: "nextMatch", nextMatch: `${match.getPlayer1().getName()} VS ${match.getPlayer2().getName()}`}));
		});
	}
	private resetNextMatch(s: string) {
		clients.forEach((value: Client, key: string) => {
			value.socketStream.send(JSON.stringify({type: "nextMatch", nextMatch: `${s}`}));
		});
	}
	public createNextMatch() {
		this.tournament.createNextRound();
		const nextMatch: Match | undefined = this.tournament.getNextMatch()?.value;
		if (nextMatch)
			this.sendNextMatch(nextMatch);
		// enlever dans launch la creation
	}
	public launchTournament(players: Map<string, Player>): void {
		this.createTournament(players);
		this.tournament.createNextRound();
		const nextMatch: Match | undefined = this.tournament.getNextMatch()?.value;
		if (nextMatch) {
			this.sendNextMatch(nextMatch);
		}
		this.tournament.launch();
	}
	public launchSolo(): void {
		this.soloMatchRunning = true;
	}
	public stopSolo(): void {
		this.soloMatchRunning = false;
	}
	public getSolo(): boolean {
		return this.soloMatchRunning;
	}
	public endTournament(): void
	{
		// Envoyer a la blockchain les resultats du tournois

		/*
		objectif :
		contexte on a			[player1, player2, player3]
		dont les ids sont		[   1   ,    2   ,    3   ]
		qui ont respectivement  [2points, 3points, 6points]
		*/

		let historic: Array<Match> = this.tournament.getHistoric();

		let match: Match;
		let id_player1: number;
		let id_player2: number;

		let playerScores: Map<number, number> = new Map();

		for (let i = 0; i < historic.length; i++)
		{
			match = historic[i];

			const points: number = match.getRound();

			id_player1 = match.getPlayer1().getDBId();
			id_player2 = match.getPlayer2().getDBId();

			const winner = match.getWinner();
			if (winner === match.getPlayer1())
			{
				const currentScore = playerScores.get(id_player1) ?? 0;
				playerScores.set(id_player1, currentScore + points);

				// Perdant (ajouté à 0 si pas déjà là)
				if (!playerScores.has(id_player2)) {
					playerScores.set(id_player2, 0);
				}
			}
			else if (winner === match.getPlayer2())
			{
				const currentScore = playerScores.get(id_player2) ?? 0;
				playerScores.set(id_player2, currentScore + points);

				// Perdant (ajouté à 0 si pas déjà là)
				if (!playerScores.has(id_player1)) {
					playerScores.set(id_player1, 0);
				}
			}
		}

		let player_ids: number[] = [];
		let scores: number[] = [];

		for (const [id, score] of playerScores)
		{
			player_ids.push(id);
			scores.push(score);
		}

		console.log("ids:", player_ids);
		console.log("scores:", scores);

		SC.SC_addTournament( player_ids, scores );

		this.tournament.stop();
		this.resetNextMatch("???");
	}

    public getGame(): Game {
        return this.game;
    }

	public createTournament(players: Map<string, Player>):void {
		this.tournament = new Tournament(players);
	}

    public getTournament(): Tournament {
        return this.tournament;
    }

    public getState(): GameState {
        const state: GameState = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            player1Y: this.getGame().getPlayer1().getY(),
            player2Y: this.getGame().getPlayer2().getY(),
            player1Score: this.getGame().getPlayer1().getScore(),
            player2Score: this.getGame().getPlayer2().getScore(),
			player1Name: this.getGame().getPlayer1().getName(),
    		player2Name: this.getGame().getPlayer2().getName(),
			player1Id: this.getGame().getPlayer1().getId(),
    		player2Id: this.getGame().getPlayer2().getId(),
        };
        return state;
    }
}
