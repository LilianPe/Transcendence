import { PlayerMoves } from "../Pong/Player.js";
import { PlayerType } from "./interfaces.js";
import { game, offMove } from "./offlineManager.js";

let AI_y_target: number = 0;
let aiLoopActive = false;
let aiKeys = {
	up: false,
	down: false,
};

export function startAI(): void {
	if (!aiLoopActive) {
		aiLoopActive = true;
		requestAnimationFrame(updateMoves);
	}
}

export function stopAI(): void {
	aiLoopActive = false;
}

function updateMoves(): void {
	if (!aiLoopActive) return;
	if (Math.abs(game.getGame().getPlayer2().getY() - AI_y_target) > 10)
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

export function AIMove(): void {
	const paddle = game.getGame().getPlayer2();
	const currentY = paddle.getY();

	if (currentY < AI_y_target) {
		aiKeys.up = false;
		aiKeys.down = true;
	} else if (currentY > AI_y_target) {
		aiKeys.down = false;
		aiKeys.up = true;
	} else {
		aiKeys.up = false;
		aiKeys.down = false;
	}
}

let predictionCount = 0;
export function predictLandingY(): void {
	const ball = game.getGame().getBall();

	const x0 = ball.getX();
	const y0 = ball.getY();
	const dx = ball.getDX();
	const dy = ball.getDY();
	const width = 800;
	const height = 800;
	const paddleX = 770;

	const xTravel = paddleX - x0;
	let yTravel = (dy / dx) * xTravel;
	let predictedY = y0 + yTravel;

	while (predictedY < 0 || predictedY > height - 10) {
		if (predictedY < 0) {
			predictedY = -predictedY;
		} else if (predictedY > height - 10) {
			predictedY = 2 * (height - 10) - predictedY;
		}
	}

	predictionCount++;
	let randomOffset = 0;
	if (predictionCount % 5 === 0) {
		randomOffset += Math.floor(Math.random() * 170) - 85;
	}
	else
	{
		randomOffset = Math.floor(Math.random() * 80) - 40;
	}

	AI_y_target = predictedY - 50 + randomOffset;
}