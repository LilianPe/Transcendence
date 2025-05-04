import { displayLaunchError } from "../Online/pongDisplayOnline.js";
import { PlayerMoves } from "../Pong/Player.js";
import { Pong } from "../Pong/Pong.js";
import { PlayerType } from "./interfaces.js";
import { startAI, stopAI } from "./pongAiExecutor.js";

export let game = new Pong();

export function offMove(player: PlayerType, move: PlayerMoves, type: PlayerType = PlayerType.Player): void {
	game.update(move, player);
}
export function offStart(): void {
	if (game.getGame().getRound().isRunning()) {
		displayLaunchError("A game is already running.");
	} else {
		game.getGame().launch();
		startAI();
	}
}

export function stopOff(): void {
	game.getGame().getRound().stop();
	stopAI();
}

export function offReset(): void {
	game = new Pong();
	stopAI();
}

