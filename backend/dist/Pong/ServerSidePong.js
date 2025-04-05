import { Game } from "./Game.js";
import { Player } from "./Player.js";
export class ServerSidePong {
    constructor() {
        this.game = new Game(new Player("default", ""), new Player("default", ""));
        this.running = 0;
    }
    launchGame(player1, player2) {
        this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    update(message, clients, clientID) {
        this.game.update(message, clients, clientID);
        if (message == "start") {
            if (this.game.getRound().isRunning())
                clients.get(clientID)?.send("Already running");
            else if (clients.size < 2)
                clients.get(clientID)?.send("Not enought players");
            else {
                const clientKeys = Array.from(clients.keys());
                this.launchGame(new Player("default", clientKeys[0]), new Player("default", clientKeys[1]));
            }
        }
    }
    check(clients, clientID) {
        if (!this.game.getRound().isRunning())
            return;
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop();
            clients.get(this.game.getPlayer2().getId()).send("Opponent disconected");
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop();
            clients.get(this.game.getPlayer1().getId()).send("Opponent disconected");
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
