import { Round } from "./Round.js";
export class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = new Round(player1, player2);
    }
    launch() {
        this.player1.reset();
        this.player2.reset();
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
            case "Up" /* PlayerMoves.MoveUp */:
                player.moveUp();
                break;
            case "Down" /* PlayerMoves.MoveDown */:
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
