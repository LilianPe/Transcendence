// @ts-ignore
import { SocketStream } from "@fastify/websocket";
import { Game, GameState } from "./Game.js";
import { Player } from "./Player.js";

export class ServerSidePong {
    private game: Game;
    private running: number;

    constructor() {
        this.game = new Game(new Player("default"), new Player("default"));
        this.running = 0;
    }
    launchGame(player1: Player, player2: Player): void {
        this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    update(message: string, socket: SocketStream): void {
        this.game.update(message, socket);
        if (message == "start") {
            if (!this.game.getRound().isRunning())
                this.launchGame(new Player("default"), new Player("default"));
            else socket.send("Already running");
        }
    }
    getGame(): Game {
        return this.game;
    }
    getState(): GameState {
        const state: GameState = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            player1Y: this.getGame().getPlayer1().getY(),
            player2Y: this.getGame().getPlayer2().getY(),
            player1Score: this.getGame().getPlayer1().getScore(),
            player2Score: this.getGame().getPlayer2().getScore(),
        };
        return state;
    }
}
