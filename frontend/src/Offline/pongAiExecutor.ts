import { displayLaunchError } from "../Online/pongDisplayOnline.js";
import { GameState } from "../Pong/Game.js";
import { Pong } from "../Pong/Pong.js";
import { displayLine, displayScore, drawLeftPlayer, drawRightPlayer } from "./pongDisplayOff.js";
import { PlayerMoves } from "../Pong/Player.js";
import { PongAIPredictor } from "./PongAIPredictor.js";

let game = new Pong();
const ai = new PongAIPredictor(game);

export const enum PlayerType {
	Player = "PLAYER",
	Ai = "AI",
}

export function offStart(): void {
	if (game.getGame().getRound().isRunning()) {
		displayLaunchError("A game is already running.");
	}
	else {
		game.getGame().launch();
	}
}

export function offMove(targetY: number): void {
	const paddle = game.getGame().getPlayer2();
	const currentY = paddle.getY() + 50;

	const randomOffset = Math.floor(Math.random() * 40) - 20; // [-20, +20]
	const destination = targetY + randomOffset;

	while (Math.abs(paddle.getY() + 50 - destination) > 5) {
		if (paddle.getY() + 50 < destination) {
			game.update(PlayerMoves.MoveDown, PlayerType.Ai);
		} else {
			game.update(PlayerMoves.MoveUp, PlayerType.Ai);
		}
	}
}


export function renderLocal(canvasContext: CanvasRenderingContext2D): void {
	const currentState: GameState = game.getState();
	canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, 800, 800);
    displayLine(canvasContext);
    drawLeftPlayer(currentState.player1Y, canvasContext);
    drawRightPlayer(currentState.player2Y, canvasContext);
    displayScore(currentState.player1Score, currentState.player2Score, canvasContext);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(currentState.ballX, currentState.ballY, 10, 10);
}

export function stopOff(): void {
	game.getGame().getRound().stop();
}

export function offReset(): void {
	game = new Pong();
}
