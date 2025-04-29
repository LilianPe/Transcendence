// tournois marche a 2 mais a + de deux, toujours les deux meme qui jouent et pas de fin, revoir matchmaking.
// + stocker les resultats

import { clients, game } from "../server.js";
import { Client, registeredTournament } from "../Server/webSocket.js";
import { Match } from "./Match.js";
import { Player } from "./Player.js";

export type Ref<T> = {value: T};

export class Tournament {
	private date: number;
	private round: number;
	private launched: boolean;
	private ended: boolean;
	private winner: Player | undefined;
	private players: Map<string, Player> | undefined;
	private matches: Array<Match> | undefined;
	private nextMatch: Ref<Match> | undefined;
	private historic: Array<Match>;

	constructor(players: Map<string, Player> | undefined) {
		this.date = 0;
		this.launched = false;
		this.ended = false;
		this.players = players;
		this.round = 1;
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
			if (players[i].isLogout()) continue;
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
				this.matches.push(new Match(player1, player2, this.round));
				console.log(`New match created: Player1: ${player1.getId()} | Player2: ${player2.getId()}`);
				player1 = players[i];
				player2 = undefined;
			}
		}
		if (player1) {
			const s = player2 ? player2.getId() : "undef";
			console.log(`New match created: Player1: ${player1.getId()} | Player2: ${s}`);
			this.matches.push(new Match(player1, player2, this.round));
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
		// cree des nouveaux matchs mais par rapport a matches.getWinner;
		if (!this.matches) return;
		let nextMatches: Array<Match> = [];
		let player1: Player | undefined;
		let player2: Player | undefined;
		this.round++;
		for (let i: number = this.matches.length - 1; i >= 0 ; i--) {
			if (this.matches[i].getWinner()?.isLogout()) {
				continue;
			}
			if (!player1) player1 = this.matches[i].getWinner();
			else if (!player2) {
				console.log(`Match ${i}: Ended: ${this.matches[i].isEnded}, winner: ${this.matches[i].getWinner()}`);
				player2 = this.matches[i].getWinner();
			}
			else {
				nextMatches.push(new Match(player1, player2, this.round));
				// console.log(`New match: Player1 :${player1.getId()}`);
				player1 = this.matches[i].getWinner();
				player2 = undefined;
			}
		}
		if (player1) {
			nextMatches.push(new Match(player1, player2, this.round));
			// console.log(`New match: Player1 :${player1.getId()}, ${player2}`);
		}
		this.matches = nextMatches;
	}

	private getNxtMatch(): Match | undefined{
		// recupere le premier match pas finit et renvoie les joueurs du match.
		if (!this.matches) return (new Match(new Player(""), undefined, this.round));
		if (this.ended) return undefined;
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
		return new Match(new Player(""), undefined, this.round);
	}

	public nextRound() {
		if (!this.matches) return;
		console.log("All played");
		if (this.matches.length == 1) {
			console.log("TOurnamend end");
			this.winner = this.matches[0].getWinner();
			this.launched = false;
			const cli: Array<Client> = Array.from(clients.values());
			for (let i: number = 0; i < cli.length; i++) {
				cli[i].socketStream.send(JSON.stringify({type: "result", result: this.matches[0].getWinner()?.getName()}));
			}
			registeredTournament.clear();
			game.endTournament();
			this.nextMatch = undefined;
			this.ended = true;
		}
		else {
			this.createNewRounds();
			if (this.allPlayed()) {
				this.nextRound();
			}
		}
	}
	public matchmaking(): void {
		if (!this.matches) {
			console.log("creating matches");
			this.createMatches();
		}
		else if (this.allPlayed()) {
			this.nextRound();
		}
		const nextMatch: Match | undefined = this.getNxtMatch();
		const ref: Ref<Match> | undefined = nextMatch ? {value: nextMatch} : undefined;
		this.nextMatch = ref;
	}

	public createNextRound(): void {		
		this.matchmaking();
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

	public getHistoric(): Array<Match>
	{
		return this.historic;
	}
	public getNextMatch(): Ref<Match> | undefined {
		if (!this.nextMatch?.value) return undefined;
		return this.nextMatch;
	}
	public removePlayerFromTournament(clientID: string): void {
		const player: Player | undefined = this.players?.get(clientID);
		if (player) this.players?.delete(clientID);
	}
}