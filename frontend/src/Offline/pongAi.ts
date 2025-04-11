import { displayLaunchError } from "../Online/pongDisplayOnline.js";
import { GameState } from "../Pong/Game.js";
import { Pong } from "../Pong/Pong.js";
import { displayLine, displayScore, drawLeftPlayer, drawRightPlayer } from "./pongDisplayOff.js";

let game = new Pong();

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

export function offMove(move: string): void {
	game.update(move, PlayerType.Player);
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
