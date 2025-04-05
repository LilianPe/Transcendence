export class Ball {
    constructor() {
        this.x = 400;
        this.y = 400;
        this.dx = 0.3;
        this.dy = 0.7;
    }
    move(p1, p2) {
        this.x += this.dx * 6;
        this.y += this.dy * 6;
        if (this.x <= 0 || (this.x <= 30 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100)) {
            this.dx = 1;
        }
        if (this.x >= 800 - 10 ||
            (this.x + 10 >= 770 && this.y > p2.getY() - 10 && this.y < p2.getY() + 100)) {
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
        this.y = 400 - 50;
        this.score = 0;
        this.name = name;
    }
    moveUp() {
        this.y -= 5;
    }
    moveDown() {
        this.y += 5;
    }
    getY() {
        return this.y;
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
            this.ball.move(this.player1, this.player2);
        }, 1000 / 60);
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
        };
        return state;
    }
}
