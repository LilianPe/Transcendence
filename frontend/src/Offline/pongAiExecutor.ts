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

// ← Contrôle l’état de la boucle IA
let aiLoopActive = false;

// ← Boucle appelée à chaque frame quand l’IA est active
function updateMoves(): void {
	if (!aiLoopActive) return;

	if (aiKeys.up) {
		offMove(PlayerMoves.MoveUp, PlayerType.Ai);
	}
	if (aiKeys.down) {
		offMove(PlayerMoves.MoveDown, PlayerType.Ai);
	}

	requestAnimationFrame(updateMoves);
}

// ← Appelé depuis l’extérieur pour activer l’IA
export function startAI(): void {
	if (!aiLoopActive) {
		aiLoopActive = true;
		requestAnimationFrame(updateMoves);
	}
}

// ← Pour désactiver l’IA à tout moment
export function stopAI(): void {
	aiLoopActive = false;
}

export function offStart(): void {
	if (game.getGame().getRound().isRunning()) {
		displayLaunchError("A game is already running.");
	} else {
		game.getGame().launch();
		startAI();
	}
}

export function offMove(move: PlayerMoves, type: PlayerType = PlayerType.Player): void {
	game.update(move, type);
}

export function AIMove(targetY: number): void {
	const paddle = game.getGame().getPlayer2();
	const currentY = paddle.getY();

	const randomOffset = 0 // Math.floor(Math.random() * 40) - 20; // [-20, +20]
	const destination = targetY + randomOffset;

	// Simule une intention de bouger
	if (currentY < destination) {
		aiKeys.up = false;
		aiKeys.down = true;
	} else if (currentY > destination) {
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

	let dx = ball.getDX(); // distance x
	let dy = ball.getDY(); // distance y

	let y = 800 * ball.getDY() / ball.getDX() + ball.getY(); // ratio + y

	if (y < 0) {
		y = -y;
	} else if (y > 800) {
		y = 2 * (800) - y;
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
	stopAI(); // Stop IA proprement
}

export function offReset(): void {
	game = new Pong();
	stopAI(); // Reset aussi l’état IA
}
