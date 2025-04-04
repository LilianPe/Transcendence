export class Ball {
    private x: number;
    private y: number;
    private dx: number;
    private dy: number;
    private speed: number;
    private maxSpeed: number;

    constructor() {
        this.x = 400;
        this.y = 400;
        this.dx = 1;
        this.dy = 1;
        this.speed = 6;
        this.maxSpeed = 12;
    }

    move(p1: Player, p2: Player): void {
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

    private adjustSpeed(): void {
        this.speed += 0.5;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    private adjustAngle(playerY: number): void {
        const relativeHitPoint = this.y - (playerY + 50);
        const normalizedHitPoint = relativeHitPoint / 50;
        this.dy = normalizedHitPoint * 1.5;
    }

    private reset(): void {
        this.x = 400;
        this.y = 400;
        this.dx = this.dx > 0 ? -1 : 1;
        this.dy = Math.random() * 2 - 1;
        this.speed = 6;
    }

    public getX(): number {
        return this.x;
    }
    public getY(): number {
        return this.y;
    }
    public getSpeed(): number {
        return this.speed;
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
        if (this.y < 0) this.y = 0;
    }
    moveDown() {
        this.y += 5;
        if (this.y > 700) this.y = 700;
    }
    getY(): number {
        return this.y;
    }
    getScore(): number {
        return this.score;
    }
    incrementScore(): void {
        this.score++;
    }
}

class Round {
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

    run(): void {
        this.running = true;
        const targetFrameTime = 30;

        const update = (timestamp: number) => {
            if (!this.running) return;

            if (!this.lastUpdate || timestamp - this.lastUpdate >= targetFrameTime) {
                this.ball.move(this.player1, this.player2);
                // console.log("Time between update:", timestamp - this.lastUpdate, "Speed:", this.ball.getSpeed());
                this.lastUpdate = timestamp;
            }
            setTimeout(() => update(performance.now()), targetFrameTime);
        };

        update(performance.now());
    }

    stop(): void {
        this.running = false;
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
    player1Score: number;
    player2Score: number;
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
            player1Score: this.getGame().getPlayer1().getScore(),
            player2Score: this.getGame().getPlayer2().getScore(),
        };
        return state;
    }
}
