import { Ball } from "./Ball.js";
import { Player } from "./Player.js";

export class Round {
    private player1: Player;
    private player2: Player;
    private ball: Ball;
    private lastUpdate: number;
    private running: boolean;

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
        this.lastUpdate = 0;
        this.running = false;
    }

    public run(): void {
        this.running = true;
        const targetFrameTime = 30;
		// predictLandingY();
		// AIMove();

        const update = (timestamp: number) => {
            if (!this.running) return;

            if (!this.lastUpdate || timestamp - this.lastUpdate >= targetFrameTime) {
                this.ball.move(this.player1, this.player2);
                // console.log("Time between update:", timestamp - this.lastUpdate, "Speed:", this.ball.getSpeed());
                this.lastUpdate = timestamp;
                if (this.player1.getScore() == 3 || this.player2.getScore() == 3)
                    this.running = false;
            }
            setTimeout(() => update(performance.now()), targetFrameTime);
        };

        update(performance.now());
    }

    public stop(): void {
        this.running = false;
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
