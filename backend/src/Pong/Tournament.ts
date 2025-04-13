// tournois marche a 2 mais a + de deux, toujours les deux meme qui jouent et pas de fin, revoir matchmaking.
// + stocker les resultats

import { Match } from "./Match.js";
import { Player } from "./Player.js";

export type Ref<T> = {value: T};

export class Tournament {
	private date: number;
	private launched: boolean;
	private winner: Player | undefined;
	private players: Map<string, Player> | undefined;
	private matches: Array<Match> | undefined;
	private historic: Array<Match>;

	constructor(players: Map<string, Player> | undefined) {
		this.date = 0;
		this.launched = false;
		this.players = players;
		this.matches = undefined;
		this.winner = undefined;
		this.historic = [];
	}

	private createMatches(): void {
		// creer matches par rapport a players
		if (!this.players) return;
		let player1: Player | undefined;
		let player2: Player | undefined;
		const players: Array<Player> = Array.from(this.players.values());
		this.matches = [];
		for (let i: number = 0; i < players.length; i++) {
			players[i].setTournamentID(i);
			console.log(`Adding: ${players[i].getId()} in matches. Tournament id: ${players[i].getTournamentID()}.`);
			if (!player1){
				console.log("Adding player1")
				player1 = players[i];
			} 
			else if (!player2){
				console.log("Adding player2")
				player2 = players[i];
			} 
			else {
				this.matches.push(new Match(player1, player2));
				console.log(`New match created: Player1: ${player1.getId()} | Player2: ${player2.getId()}`);
				player1 = players[i];
				player2 = undefined;
			}
		}
		if (player1) {
			const s = player2 ? player2.getId() : "undef";
			console.log(`New match created: Player1: ${player1.getId()} | Player2: ${s}`);
			this.matches.push(new Match(player1, player2));
		}
	}
	
	private allPlayed(): boolean {
		// parcours matches, si tous ended, retourne 1
		if (!this.matches) return true;
		for (let i: number = 0; i < this.matches?.length; i++) {
			console.log(`Match ${i}: ended: ${this.matches[i].isEnded()}`)
			if (!this.matches[i].isEnded()) return false;
		}
		console.log("test");
		return true;
	}
	
	private createNewRounds(): void {
		console.log("Round 2");
		// cree des nouveaux matchs mais par rapport a matches.getWinner;
		if (!this.matches) return;
		console.log("Debug");
		let nextMatches: Array<Match> = [];
		let player1: Player | undefined;
		let player2: Player | undefined;
		for (let i: number = this.matches.length - 1; i >= 0 ; i--) {
			if (!player1) player1 = this.matches[i].getWinner();
			else if (!player2) {
				console.log(`Match ${i}: Ended: ${this.matches[i].isEnded}, winner: ${this.matches[i].getWinner()}`);
				player2 = this.matches[i].getWinner();
			}
			else {
				nextMatches.push(new Match(player1, player2));
				console.log(`New match: Player1 :${player1.getId()}`);
				player1 = this.matches[i].getWinner();
				player2 = undefined;
			}
		}
		if (player1) {
			nextMatches.push(new Match(player1, player2));
			console.log(`New match: Player1 :${player1.getId()}`);
		}
		this.matches = nextMatches;
	}

	private getNextMatch(): Match {
		// recupere le premier match pas finit et renvoie les joueurs du match.
		if (!this.matches) return (new Match(new Player(""), undefined));
		if (this.matches.length == 1) {
			console.log("Returning final.");
			this.matches[0].setFinal();
			return this.matches[0];
		}
		for (let i: number = 0; i < this.matches?.length; i++) {
			if (!this.matches[i].isEnded()){
				return this.matches[i];
			} 
		}
		return (new Match(new Player(""), undefined));
	}

	public matchmaking(): Ref<Match> {
		if (!this.matches) {
			console.log("creating matches");
			this.createMatches();
		}
		else if (this.allPlayed()) {
			if (this.matches.length == 1) {
				this.winner = this.matches[0].getWinner();
				this.launched = false;
				return ({value: new Match(new Player(""), undefined)});
				// afficher le gagnant ou autre, mais montrer que le tournois est finit
			}
			this.createNewRounds();
		}
		const ref: Ref<Match> = {value: this.getNextMatch()};
		return (ref);
	}

	public nextRound(): Ref<Match> {		
		return (this.matchmaking());
	}

	public launch(): void {
		this.launched = true;
	}
	public stop(): void {
		this.launched = false;
	}

	public saveMatch(match: Ref<Match>): void {
		this.historic.push(match.value);
		if (match.value.isFinal()) {
			this.winner = match.value.getWinner();
		}
	}

	public isLaunched(): boolean {
		return this.launched;
	}
}