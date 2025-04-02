export class Ball {
    constructor() {
        this.x = 400;
        this.y = 400;
        this.dx = 0.3;
        this.dy = 0.7;
    }
    move() {
        this.x += this.dx * 6;
        this.y += this.dy * 6;
        if (this.x <= 0) {
            this.dx = 1;
        }
        if (this.x >= 800 - 10) {
            this.dx = -1;
        }
        if (this.y <= 0) {
            this.dy = -this.dy;
        }
        if (this.y >= 800 - 10) {
            this.dy = -this.dy;
        }
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
}
export class Player {
    constructor(name) {
        this.y = 400;
        this.score = 0;
        this.name = name;
    }
}
class Round {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
    }
    run() {
        setInterval(() => {
            this.ball.move();
        }, 1000 / 60);
    }
    getBall() {
        return this.ball;
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
    getBall() {
        return this.round.getBall();
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
    getGame() {
        return this.game;
    }
}
