import { displayLaunchError } from "../Online/pongDisplayOnline.js";
import { GameState } from "../Pong/Game.js";
import { Pong } from "../Pong/Pong.js";
import { displayLine, displayScore, drawLeftPlayer, drawRightPlayer } from "./pongDisplayOff.js";
import { PlayerMoves } from "../Pong/Player.js";

let game = new Pong();

export const enum PlayerType {
	Player = "PLAYER",
	Ai = "AI",
}

// ← Simule l'état des touches pour l'IA
export const aiKeys = {
	up: false,
	down: false,
};

// ← Appelé à chaque frame
export function updateMoves(): void {
	// Exemple pour le joueur humain si tu veux (si keys.w etc.)

	// Déplacement IA simulé
	if (aiKeys.up) {
		offMove(PlayerMoves.MoveUp);
	}
	if (aiKeys.down) {
		offMove(PlayerMoves.MoveDown);
	}

	requestAnimationFrame(updateMoves);
}

export function offStart(): void {
	if (game.getGame().getRound().isRunning()) {
		displayLaunchError("A game is already running.");
	} else {
		game.getGame().launch();
	}
}

export function offMove(move: PlayerMoves): void {
	game.update(move, PlayerType.Ai);
}

export function AIMove(targetY: number): void {
	const paddle = game.getGame().getPlayer2();
	const currentY = paddle.getY() + 50;

	const randomOffset = Math.floor(Math.random() * 40) - 20; // [-20, +20]
	const destination = targetY + randomOffset;

	// Simule une intention de bouger
	if (currentY < destination - 5) {
		aiKeys.up = false;
		aiKeys.down = true;
	} else if (currentY > destination + 5) {
		aiKeys.down = false;
		aiKeys.up = true;
	} else {
		// Zone neutre
		aiKeys.up = false;
		aiKeys.down = false;
	}
}

export function predictLandingY(): number {
	const ball = game.getGame().getBall();

	const x0 = ball.getX();
	const y0 = ball.getY();
	const angle = ball.getAngle(); // radians

	const tableHeight = 800;
	const targetX = 770;

	const dx = targetX - x0;
	let y = y0 + Math.tan(angle) * dx;

	if (y > tableHeight) {
		y = 2 * tableHeight - y;
	} else if (y < 0) {
		y = -y;
	}

	return y;
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
