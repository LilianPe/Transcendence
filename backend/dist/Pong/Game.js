import { Round } from "./Round.js";
export class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = new Round(player1, player2);
    }
    launch() {
        this.round = new Round(this.player1, this.player2);
        this.round.run();
    }
    update(move, clients, clientId) {
        let player;
        if (clientId == this.player1.getId())
            player = this.player1;
        else if (clientId == this.player2.getId())
            player = this.player2;
        else
            return;
        switch (move) {
            case "LU":
                player.moveUp();
                break;
            case "LD":
                player.moveDown();
                break;
        }
    }
    getBall() {
        return this.round.getBall();
    }
    getRound() {
        return this.round;
    }
    getPlayer1() {
        return this.player1;
    }
    getPlayer2() {
        return this.player2;
    }
}
