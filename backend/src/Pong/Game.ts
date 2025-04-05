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
    update(move: string, clients: Map<string, SocketStream>, clientId: string): void {
        let player;
        if (clientId == this.player1.getId()) player = this.player1;
        else if (clientId == this.player2.getId()) player = this.player2;
        else return;
        switch (move) {
            case "LU":
                player.moveUp();
                break;
            case "LD":
                player.moveDown();
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
