import { Player } from "./Player.js";

export class Ball {
    private x: number;
    private y: number;
    private dx: number;
    private dy: number;
    private speed: number;
    private maxSpeed: number;

    constructor() {
        this.x = 395;
        this.y = 395;
        this.dx = 1;
        this.dy = 1;
        this.speed = 9;
        this.maxSpeed = 14;
    }

    public move(p1: Player, p2: Player): void {
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

        if (this.x <= 30 && this.x >= 20 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100) {
            this.x = 30;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p1.getY());
        }

        if (
            this.x + 10 >= 770 &&
            this.x + 10 <= 780 &&
            this.y > p2.getY() - 10 &&
            this.y < p2.getY() + 100
        ) {
            this.x = 760;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p2.getY());
        }

        if (this.x <= -10) {
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
        this.x = 395;
        this.y = 395;
        this.dx = this.dx > 0 ? -1 : 1;
        this.dy = Math.random() * 2 - 1;
        this.speed = 9;
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
