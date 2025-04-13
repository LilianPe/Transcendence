import { clients, game } from "../server.js";
import { Client, registeredTournament } from "../Server/webSocket.js";
import { Ball } from "./Ball.js";
import { Match } from "./Match.js";
import { Player } from "./Player.js";
import { Ref } from "./Tournament.js";

export class Round {
    private player1: Player;
    private player2: Player;
    private ball: Ball;
    private lastUpdate: number;
    private running: boolean;
    private match: Ref<Match>;

    constructor(player1: Player, player2: Player, match: Ref<Match>) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
        this.lastUpdate = 0;
        this.running = false;
        this.match = match;
    }

    public run(): void {
        this.running = true;
        const targetFrameTime: number = 30;

        const update = (timestamp: number): void => {
            if (!this.running) return;

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

    public stop(id: string | undefined): void {
        this.running = false;
		this.match.value.end();
		game.getTournament().saveMatch(this.match);
		let winner: Player;
		if (id) { // si deconnextion, winner est adversaire
			if (id == this.player1.getId()) winner = this.player2;
			else winner = this.player1;
		}
		else { //sinon plus gros score
			if (this.player1.getScore() > this.player2.getScore()) winner = this.player1;
			else winner = this.player2;
		}
		
		if (this.match.value.isFinal()) {
			game.endTournament();
			const cli: Array<Client> = Array.from(clients.values());
			for (let i: number = 0; i < cli.length; i++) {
				cli[i].socketStream.send(JSON.stringify({type: "result", result: winner.getName()}));
			}
			registeredTournament.clear();
		}
    }

    public getBall(): Ball {
        return this.ball;
    }
    public getPlayer1(): Player {
        return this.player1;
    }
    public getPlayer2(): Player {
        return this.player2;
    }
    public isRunning(): boolean {
        return this.running;
    }
}
