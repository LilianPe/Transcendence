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

    move(): void {
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
        this.y = 400;
        this.score = 0;
        this.name = name;
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
            this.ball.move();
        }, 1000 / 60);
    }

    getBall(): Ball {
        return this.ball;
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
    getBall(): Ball {
        return this.round.getBall();
    }
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

    getGame(): Game {
        return this.game;
    }
}
