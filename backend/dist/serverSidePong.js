export class Ball {
    constructor() {
        this.x = 400;
        this.y = 400;
        this.dx = 1;
        this.dy = 1;
        this.speed = 6;
        this.maxSpeed = 12;
    }
    move(p1, p2) {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        if (this.y <= 0) {
            this.y = 0;
            this.dy = -this.dy;
        }
        if (this.y >= 800 - 10) {
            this.y = 800 - 10;
            this.dy = -this.dy;
        }
        if (this.x <= 30 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100) {
            this.x = 30;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p1.getY());
        }
        if (this.x + 10 >= 770 && this.y > p2.getY() - 10 && this.y < p2.getY() + 100) {
            this.x = 760;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p2.getY());
        }
        if (this.x <= 0) {
            p2.incrementScore();
            this.reset();
        }
        if (this.x >= 800) {
            p1.incrementScore();
            this.reset();
        }
    }
    adjustSpeed() {
        this.speed += 0.5;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }
    adjustAngle(playerY) {
        const relativeHitPoint = this.y - (playerY + 50);
        const normalizedHitPoint = relativeHitPoint / 50;
        this.dy = normalizedHitPoint * 1.5;
    }
    reset() {
        this.x = 400;
        this.y = 400;
        this.dx = this.dx > 0 ? -1 : 1;
        this.dy = Math.random() * 2 - 1;
        this.speed = 6;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getSpeed() {
        return this.speed;
    }
}
export class Player {
    constructor(name) {
        this.y = 400 - 50;
        this.score = 0;
        this.name = name;
    }
    moveUp() {
        this.y -= 5;
        if (this.y < 0)
            this.y = 0;
    }
    moveDown() {
        this.y += 5;
        if (this.y > 700)
            this.y = 700;
    }
    getY() {
        return this.y;
    }
    getScore() {
        return this.score;
    }
    incrementScore() {
        this.score++;
    }
}
class Round {
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
}
export class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = new Round(player1, player2);
    }
    launch() {
        this.round = new Round(this.player1, this.player2);
        this.round.run();
    }
    update(move) {
        switch (move) {
            case "LU":
                this.player1.moveUp();
                break;
            case "LD":
                this.player1.moveDown();
                break;
            case "RU":
                this.player2.moveUp();
                break;
            case "RD":
                this.player2.moveDown();
                break;
        }
    }
    getBall() {
        return this.round.getBall();
    }
    getPlayer1() {
        return this.player1;
    }
    getPlayer2() {
        return this.player2;
    }
}
export class ServerSidePong {
    constructor() {
        this.game = new Game(new Player("default"), new Player("default"));
        this.running = 0;
    }
    launchGame(player1, player2) {
        this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    update(message) {
        this.game.update(message);
    }
    getGame() {
        return this.game;
    }
    getState() {
        const state = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            player1Y: this.getGame().getPlayer1().getY(),
            player2Y: this.getGame().getPlayer2().getY(),
            player1Score: this.getGame().getPlayer1().getScore(),
            player2Score: this.getGame().getPlayer2().getScore(),
        };
        return state;
    }
}
