// @ts-ignore
import { Client } from "../server.js";
import { Game, GameState } from "./Game.js";
import { Match } from "./Match.js";
import { Player } from "./Player.js";
import { Ref, Tournament } from "./Tournament.js";

export class ServerSidePong {
    private game: Game;
    private running: number;
	private tournament: Tournament;

    constructor() {
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
        
		if (message == "start") {
			if (!clients.get(clientID)?.player.isRegistered()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "You are not registered."}));
            else if (this.game.getRound().isRunning()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "A game is already running."}));
            else if (!this.tournament.isLaunched()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "No tournament launched."}));
				else {
					console.log("Game launched");
					const match: Ref<Match> = this.tournament.nextRound();
					console.log(`Player1: ${match.value.getPlayer1().getId()} | Player2: ${match.value.getPlayer2().getId()}`)			
					this.launchGame(match);
            }
        }
    }

    public check(clients: Map<string, Client>, clientID: string): void {
        if (!this.game.getRound().isRunning()) return;
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop(clientID);
            clients.get(this.game.getPlayer2().getId())?.socketStream.send(JSON.stringify({type: "error", error: "Opponent disconected."}));
			// enlever aussi joueur du tournois et faire gagner l'autre
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop(clientID);
            clients.get(this.game.getPlayer1().getId())?.socketStream.send(JSON.stringify({type: "error", error: "Opponent disconected."}));
			// enlever aussi joueur du tournois et faire gagner l'autre
        }
    }

	public launchTournament(players: Map<string, Player>): void {
		this.createTournament(players);
		this.tournament.launch();
	}
	public endTournament(): void {
		// Envoyer a la blockchain les resultats du tournois
		this.tournament.stop();
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
