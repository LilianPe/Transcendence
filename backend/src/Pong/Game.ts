//@ts-ignore
import { SocketStream } from "@fastify/websocket";
import { Ball } from "./Ball.js";
import { Player } from "./Player.js";
import { Round } from "./Round.js";

export class Game {
    private round: Round;
    private player1: Player;
    private player2: Player;

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = new Round(player1, player2);
    }
    launch(): void {
        this.round = new Round(this.player1, this.player2);
        this.round.run();
    }
    update(move: string, socket: SocketStream): void {
        switch (move) {
            case "LU":
                this.player1.moveUp();
                break;
            case "LD":
                this.player1.moveDown();
                break;
            case "RU":
                this.player2.moveUp();
                break;
            case "RD":
                this.player2.moveDown();
                break;
        }
    }
    getBall(): Ball {
        return this.round.getBall();
    }
    getRound(): Round {
        return this.round;
    }
    getPlayer1(): Player {
        return this.player1;
    }
    getPlayer2(): Player {
        return this.player2;
    }
}

export interface GameState {
    ballX: number;
    ballY: number;
    player1Y: number;
    player2Y: number;
    player1Score: number;
    player2Score: number;
}
