// @ts-ignore
import { clients, registeredClients } from "../server.js";
import { Game } from "./Game.js";
import { Player } from "./Player.js";
import { Tournament } from "./Tournament.js";
import * as SC from "../Blockchain/SC_interact.js";
// import { getUserFromDB } from "../Database/requests.js"
export class ServerSidePong {
    constructor() {
        this.soloMatchRunning = false;
        this.running = 0;
        this.tournament = new Tournament(undefined);
        this.game = new Game(new Player(""), new Player(""));
    }
    launchGame(match) {
        // console.log(`New game launched, Player1: ${player1.getName()}, Player2: ${player2.getName()}`)
        this.game = new Game(match.value.getPlayer1(), match.value.getPlayer2());
        this.running = 1;
        this.game.launch(match);
    }
    update(message, clients, registeredTournament, clientID) {
        this.game.update(message, clients, clientID);
        console.log(message);
        if (message == "start") {
            console.log("debug");
            if (!clients.get(clientID)?.player.isRegistered())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "You are not registered." }));
            else if (this.game.getRound().isRunning())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "A game is already running." }));
            else if (!this.tournament.isLaunched())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "No tournament launched." }));
            else {
                console.log("Game launched");
                // this.tournament.createNextRound();
                const match = this.tournament.getNextMatch();
                if (match) {
                    // console.log(`Player1: ${match.value.getPlayer1().getId()} | Player2: ${match.value.getPlayer2().getId()}`)			
                    this.launchGame(match);
                    this.launchSolo();
                }
                else {
                    clients.forEach((value, key) => {
                        value.webSocket.send(JSON.stringify({ type: "error", error: "Matchmaking error." }));
                    });
                }
            }
        }
    }
    notifyDisconection(clientID) {
        const disconected = registeredClients.get(clientID)?.player;
        if (!disconected)
            return;
        disconected.disconect();
        clients.forEach((value, key) => {
            value.socketStream.send(JSON.stringify({ type: "error", error: `${disconected.getName()} disconected.` }));
        });
    }
    check(clients, clientID) {
        this.notifyDisconection(clientID);
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop(clientID);
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop(clientID);
        }
        this.tournament.removePlayerFromTournament(clientID);
    }
    sendNextMatch(match) {
        clients.forEach((value, key) => {
            value.socketStream.send(JSON.stringify({ type: "nextMatch", nextMatch: `${match.getPlayer1().getName()} VS ${match.getPlayer2().getName()}` }));
        });
    }
    resetNextMatch(s) {
        clients.forEach((value, key) => {
            value.socketStream.send(JSON.stringify({ type: "nextMatch", nextMatch: `${s}` }));
        });
    }
    createNextMatch() {
        this.tournament.createNextRound();
        const nextMatch = this.tournament.getNextMatch()?.value;
        if (nextMatch)
            this.sendNextMatch(nextMatch);
        // enlever dans launch la creation
    }
    launchTournament(players) {
        this.createTournament(players);
        this.tournament.createNextRound();
        const nextMatch = this.tournament.getNextMatch()?.value;
        if (nextMatch) {
            this.sendNextMatch(nextMatch);
        }
        this.tournament.launch();
    }
    launchSolo() {
        this.soloMatchRunning = true;
    }
    stopSolo() {
        this.soloMatchRunning = false;
    }
    getSolo() {
        return this.soloMatchRunning;
    }
    endTournament() {
        // Envoyer a la blockchain les resultats du tournois
        /*
        objectif :
        contexte on a			[player1, player2, player3]
        dont les ids sont		[   1   ,    2   ,    3   ]
        qui ont respectivement  [2points, 3points, 6points]
        */
        let historic = this.tournament.getHistoric();
        let match;
        let id_player1;
        let id_player2;
        let playerScores = new Map();
        for (let i = 0; i < historic.length; i++) {
            match = historic[i];
            const points = match.getRound();
            id_player1 = match.getPlayer1().getDBId();
            id_player2 = match.getPlayer2().getDBId();
            const winner = match.getWinner();
            if (winner === match.getPlayer1()) {
                const currentScore = playerScores.get(id_player1) ?? 0;
                playerScores.set(id_player1, currentScore + points);
                // Perdant (ajouté à 0 si pas déjà là)
                if (!playerScores.has(id_player2)) {
                    playerScores.set(id_player2, 0);
                }
            }
            else if (winner === match.getPlayer2()) {
                const currentScore = playerScores.get(id_player2) ?? 0;
                playerScores.set(id_player2, currentScore + points);
                // Perdant (ajouté à 0 si pas déjà là)
                if (!playerScores.has(id_player1)) {
                    playerScores.set(id_player1, 0);
                }
            }
        }
        let player_ids = [];
        let scores = [];
        for (const [id, score] of playerScores) {
            player_ids.push(id);
            scores.push(score);
        }
        console.log("ids:", player_ids);
        console.log("scores:", scores);
        SC.SC_addTournament(player_ids, scores);
        this.tournament.stop();
        this.resetNextMatch("???");
    }
    getGame() {
        return this.game;
    }
    createTournament(players) {
        this.tournament = new Tournament(players);
    }
    getTournament() {
        return this.tournament;
    }
    getState() {
        const state = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            player1Y: this.getGame().getPlayer1().getY(),
            player2Y: this.getGame().getPlayer2().getY(),
            player1Score: this.getGame().getPlayer1().getScore(),
            player2Score: this.getGame().getPlayer2().getScore(),
            player1Name: this.getGame().getPlayer1().getName(),
            player2Name: this.getGame().getPlayer2().getName(),
            player1Id: this.getGame().getPlayer1().getId(),
            player2Id: this.getGame().getPlayer2().getId(),
        };
        return state;
    }
}
