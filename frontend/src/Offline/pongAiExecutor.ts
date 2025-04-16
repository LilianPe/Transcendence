import { displayLaunchError } from "../Online/pongDisplayOnline.js";
import { GameState } from "../Pong/Game.js";
import { Pong } from "../Pong/Pong.js";
import { displayLine, displayScore, drawLeftPlayer, drawRightPlayer } from "./pongDisplayOff.js";
import { PlayerMoves } from "../Pong/Player.js";

export let game = new Pong();

export const enum PlayerType {
	Player = "PLAYER",
	Ai = "AI",
}

// ← Simule l'état des touches pour l'IA
export const aiKeys = {
	up: false,
	down: false,
};

// the IA position targetted
let AITarget: number = 0;
// ← Contrôle l’état de la boucle IA
let aiLoopActive = false;

// ← Boucle appelée à chaque frame quand l’IA est active
function updateMoves(): void {
	if (!aiLoopActive) return;

	if (Math.abs(AITarget - game.getGame().getPlayer2().getY()) > 5)
	{
		if (aiKeys.up) {
			offMove(PlayerMoves.MoveUp, PlayerType.Ai);
		}
		if (aiKeys.down) {
			offMove(PlayerMoves.MoveDown, PlayerType.Ai);
		}
	}
	else
	{
		aiKeys.up = false;
		aiKeys.down = false;
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

export function AIMove(): void {
	const paddle = game.getGame().getPlayer2();
	const currentY = paddle.getY();

	// Simule une intention de bouger
	if (currentY < AITarget) {
		aiKeys.up = false;
		aiKeys.down = true;
	} else if (currentY > AITarget) {
		aiKeys.down = false;
		aiKeys.up = true;
	} else {
		// Zone neutre
		aiKeys.up = false;
		aiKeys.down = false;
	}
}

export function predictLandingY() {
	const ball = game.getGame().getBall();

	console.log("value y :" + ball.getY());

	let dx = ball.getDX(); // distance x

	let y = (800 - (ball.getX() * 2)) * ball.getDY() / dx + ball.getY() - 50; // ratio + y
	if (y < 0) {
		y = -y ;
	} else if (y > 800) {
		y = 2 * (800) - y;
	}
	AITarget = Math.round(y);
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
