import { currentPlayerOff } from "../frontend.js";
import { PlayerType } from "../Offline/interfaces.js";
import { Ball } from "./Ball.js";
import { Player, PlayerMoves } from "./Player.js";
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
    public launch(): void {
		this.player1.reset();
		this.player2.reset();
        this.round = new Round(this.player1, this.player2);
        this.round.run();
    }
    public update(move: string, name: string): void {
        let player;
        if (name == PlayerType.Player) player = this.player1;
        else if ((name == PlayerType.Ai && currentPlayerOff == PlayerType.Ai) || (name == PlayerType.Player2 && currentPlayerOff == PlayerType.Player2)) player = this.player2;
        else return;
        switch (move) {
            case PlayerMoves.MoveUp:
                player.moveUp();
                break;
            case PlayerMoves.MoveDown:
                player.moveDown();
                break;
        }
    }
    public getBall(): Ball {
        return this.round.getBall();
    }
    public getRound(): Round {
        return this.round;
    }
    public getPlayer1(): Player {
        return this.player1;
    }
    public getPlayer2(): Player {
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
	player1Name: string;
    player2Name: string;
	player1Id: string;
    player2Id: string;
}
