import { clients, game } from "../server.js";
import { registeredTournament } from "../Server/webSocket.js";
import { Ball } from "./Ball.js";
export class Round {
    constructor(player1, player2, match) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
        this.lastUpdate = 0;
        this.running = false;
        this.match = match;
    }
    run() {
        this.running = true;
        const targetFrameTime = 30;
        const update = (timestamp) => {
            if (!this.running)
                return;
            if (!this.lastUpdate || timestamp - this.lastUpdate >= targetFrameTime) {
                this.ball.move(this.player1, this.player2);
                // console.log("Time between update:", timestamp - this.lastUpdate, "Speed:", this.ball.getSpeed());
                this.lastUpdate = timestamp;
                if (this.player1.getScore() == 3 || this.player2.getScore() == 3)
                    this.stop(undefined);
            }
            setTimeout(() => update(performance.now()), targetFrameTime);
        };
        update(performance.now());
    }
    stop(id) {
        this.running = false;
        this.match.value.end();
        game.getTournament().saveMatch(this.match);
        let winner;
        if (id) { // si deconnextion, winner est adversaire
            if (id == this.player1.getId())
                winner = this.player2;
            else
                winner = this.player1;
        }
        else { //sinon plus gros score
            if (this.player1.getScore() > this.player2.getScore())
                winner = this.player1;
            else
                winner = this.player2;
        }
        if (this.match.value.isFinal()) {
            game.endTournament();
            const cli = Array.from(clients.values());
            for (let i = 0; i < cli.length; i++) {
                cli[i].socketStream.send(JSON.stringify({ type: "result", result: winner.getName() }));
            }
            registeredTournament.clear();
        }
        else {
            game.createNextMatch();
        }
    }
    getBall() {
        return this.ball;
    }
    getPlayer1() {
        return this.player1;
    }
    getPlayer2() {
        return this.player2;
    }
    isRunning() {
        return this.running;
    }
}
