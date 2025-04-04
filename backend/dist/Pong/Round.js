import { Ball } from "./Ball.js";
export class Round {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
        this.lastUpdate = 0;
        this.running = false;
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
                    this.running = false;
            }
            setTimeout(() => update(performance.now()), targetFrameTime);
        };
        update(performance.now());
    }
    stop() {
        this.running = false;
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
