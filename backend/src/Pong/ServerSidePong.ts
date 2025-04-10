// @ts-ignore
import { Client } from "../server.js";
import { Game, GameState } from "./Game.js";
import { Player } from "./Player.js";

export class ServerSidePong {
    private game: Game;
    private running: number;

    constructor() {
        this.game = new Game(new Player(""), new Player(""));
        this.running = 0;
    }
    public launchGame(player1: Player, player2: Player): void {
        console.log(`New game launched, Player1: ${player1.getName()}, Player2: ${player2.getName()}`)
		this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    public update(message: string, clients: Map<string, Client>, registeredClients: Map<string, Client>, clientID: string): void {
        this.game.update(message, clients, clientID);
        if (message == "start") {
			if (!clients.get(clientID)?.player.isRegistered()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "You are not registered."}));
            else if (this.game.getRound().isRunning()) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "A game is already running."}));
            else if (registeredClients.size < 2) clients.get(clientID)?.socketStream.send(JSON.stringify({type: "error", error: "Not enought player registered to launch."}));
				else {
                const clientKeys: Array<string> = Array.from(registeredClients.keys());
                const player1: Player | null = registeredClients.get(clientKeys[0])?.player;
            const player2: Player | null = registeredClients.get(clientKeys[1])?.player;

            if (player1 && player2) {
                this.launchGame(player1, player2);
            } else {
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "Erreur lors de la récupération des joueurs." }));
            }
            }
        }
    }

    public check(clients: Map<string, Client>, clientID: string): void {
        if (!this.game.getRound().isRunning()) return;
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop();
            clients.get(this.game.getPlayer2().getId())?.socketStream.send(JSON.stringify({type: "error", error: "Opponent disconected."}));
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop();
            clients.get(this.game.getPlayer1().getId())?.socketStream.send(JSON.stringify({type: "error", error: "Opponent disconected."}));
        }
    }

    public getGame(): Game {
        return this.game;
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
