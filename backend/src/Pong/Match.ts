// va servir a stocker les resultats des match
// stockera 2 joueurs et leur score respectif

import { Player } from "./Player.js";

export class Match {
	private player1: Player;
	private player2: Player;
	private winner: Player | undefined;
	private ended: boolean;
	private final: boolean;

	constructor(player1: Player, player2: Player | undefined) {
		this.player1 = player1;
		this.final = false;
		if (player2) {
			this.player2 = player2;
			this.winner = undefined;
			this.ended = false;
		}
		else {
			this.player2 = new Player("");
			this.winner = player1;
			this.ended = true;
		}
	}

	public end(): void {
		if (this.ended) return;
		this.ended = true;
		if (this.player1.getScore() == 3) {
			this.winner = this.player1;
		}
		else {
			this.winner = this.player2;
		}
	}

	public isEnded(): boolean {
		return this.ended;
	}

	public getPlayer1(): Player {
		return this.player1;
	}
	public getPlayer2(): Player {
		return this.player2;
	}
	public getWinner(): Player | undefined {
		return this.winner;
	}
	public setFinal(): void {
		this.final = true;
	}
	public isFinal(): boolean {
		return this.final;
	}
}