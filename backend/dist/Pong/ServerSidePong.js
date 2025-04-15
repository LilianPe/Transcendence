import { Game } from "./Game.js";
import { Player } from "./Player.js";
import { Tournament } from "./Tournament.js";
// import { getUserFromDB } from "../Database/requests.js"
export class ServerSidePong {
    constructor() {
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
        if (message == "start") {
            if (!clients.get(clientID)?.player.isRegistered())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "You are not registered." }));
            else if (this.game.getRound().isRunning())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "A game is already running." }));
            else if (!this.tournament.isLaunched())
                clients.get(clientID)?.socketStream.send(JSON.stringify({ type: "error", error: "No tournament launched." }));
            else {
                console.log("Game launched");
                const match = this.tournament.nextRound();
                console.log(`Player1: ${match.value.getPlayer1().getId()} | Player2: ${match.value.getPlayer2().getId()}`);
                this.launchGame(match);
            }
        }
    }
    check(clients, clientID) {
        if (!this.game.getRound().isRunning())
            return;
        if (this.game.getPlayer1().getId() == clientID) {
            this.game.getRound().stop(clientID);
            clients.get(this.game.getPlayer2().getId())?.socketStream.send(JSON.stringify({ type: "error", error: "Opponent disconected." }));
            // enlever aussi joueur du tournois et faire gagner l'autre
        }
        if (this.game.getPlayer2().getId() == clientID) {
            this.game.getRound().stop(clientID);
            clients.get(this.game.getPlayer1().getId())?.socketStream.send(JSON.stringify({ type: "error", error: "Opponent disconected." }));
            // enlever aussi joueur du tournois et faire gagner l'autre
        }
    }
    launchTournament(players) {
        this.createTournament(players);
        this.tournament.launch();
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
            id_player1 = match.getPlayer1().getDBId();
            id_player2 = match.getPlayer2().getDBId();
            const winner = match.getWinner();
            if (winner === match.getPlayer1()) {
                const currentScore = playerScores.get(id_player1) ?? 0;
                playerScores.set(id_player1, currentScore + 1);
                // Perdant (ajouté à 0 si pas déjà là)
                if (!playerScores.has(id_player2)) {
                    playerScores.set(id_player2, 0);
                }
            }
            else if (winner === match.getPlayer2()) {
                const currentScore = playerScores.get(id_player2) ?? 0;
                playerScores.set(id_player2, currentScore + 1);
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
        // SC.SC_addTournament( player_ids, scores );
        // SC.getStatusInBlockchain( 1 );
        this.tournament.stop();
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
