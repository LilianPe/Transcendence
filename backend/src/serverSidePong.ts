export class Ball {
    private x: number;
    private y: number;
    private dx: number;
    private dy: number;
    constructor() {
        this.x = 400;
        this.y = 400;
        this.dx = 0.3;
        this.dy = 0.7;
    }

    move(p1: Player, p2: Player): void {
        this.x += this.dx * 6;
        this.y += this.dy * 6;
        if (this.x <= 0 || (this.x <= 30 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100)) {
            this.dx = 1;
        }
        if (
            this.x >= 800 - 10 ||
            (this.x + 10 >= 770 && this.y > p2.getY() - 10 && this.y < p2.getY() + 100)
        ) {
            this.dx = -1;
        }
        if (this.y <= 0) {
            this.dy = -this.dy;
        }
        if (this.y >= 800 - 10) {
            this.dy = -this.dy;
        }
    }

    getX(): number {
        return this.x;
    }
    getY(): number {
        return this.y;
    }
}

export class Player {
    private y: number;
    private score: number;
    private name: string;

    constructor(name: string) {
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
    getY(): number {
        return this.y;
    }
}

class Round {
    private player1: Player;
    private player2: Player;
    private ball: Ball;

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = new Ball();
    }

    run(): void {
        setInterval(() => {
            this.ball.move(this.player1, this.player2);
        }, 1000 / 60);
    }

    getBall(): Ball {
        return this.ball;
    }
    getPlayer1(): Player {
        return this.player1;
    }
    getPlayer2(): Player {
        return this.player2;
    }
}

export class Game {
    private round: Round;
    private player1: Player;
    private player2: Player;

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = new Round(player1, player2);
    }
    launch(): void {
        this.round = new Round(this.player1, this.player2);
        this.round.run();
    }
    update(move: string): void {
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
    getBall(): Ball {
        return this.round.getBall();
    }
    getPlayer1(): Player {
        return this.player1;
    }
    getPlayer2(): Player {
        return this.player2;
    }
}

export interface GameState {
    ballX: number;
    ballY: number;
    player1Y: number;
    player2Y: number;
}

export class ServerSidePong {
    private game: Game;
    private running: number;

    constructor() {
        this.game = new Game(new Player("default"), new Player("default"));
        this.running = 0;
    }
    launchGame(player1: Player, player2: Player): void {
        this.game = new Game(player1, player2);
        this.running = 1;
        this.game.launch();
    }
    update(message: string): void {
        this.game.update(message);
    }
    getGame(): Game {
        return this.game;
    }
    getState(): GameState {
        const state: GameState = {
            ballX: this.getGame().getBall().getX(),
            ballY: this.getGame().getBall().getY(),
            player1Y: this.getGame().getPlayer1().getY(),
            player2Y: this.getGame().getPlayer2().getY(),
        };
        return state;
    }
}
