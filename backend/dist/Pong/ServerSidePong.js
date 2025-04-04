import { Game } from "./Game.js";
import { Player } from "./Player.js";
export class ServerSidePong {
    constructor() {
        this.game = new Game(new Player("default"), new Player("default"));
        this.running = 0;
    }
    launchGame(player1, player2) {
        this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    update(message, socket) {
        this.game.update(message, socket);
        if (message == "start") {
            if (!this.game.getRound().isRunning())
                this.launchGame(new Player("default"), new Player("default"));
            else
                socket.send("Already running");
        }
    }
    getGame() {
        return this.game;
    }
    getState() {
        const state = {
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
