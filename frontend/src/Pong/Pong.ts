import { Game, GameState } from "./Game.js";
import { Player } from "./Player.js";

export class Pong {
    private game: Game;
    private running: number;

    constructor() {
        this.game = new Game(new Player(), new Player());
        this.running = 0;
    }
    public launchGame(): void {
		this.game = new Game(new Player(), new Player());
        this.running = 1;
        this.game.launch();
    }
    public update(message: string, name: string): void {
        this.game.update(message, name);
    }
    public getGame(): Game {
        return this.game;
    }
    public getState(): GameState {
        const state: GameState = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            ballAngle: this.getGame().getBall().getAngle(),
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
