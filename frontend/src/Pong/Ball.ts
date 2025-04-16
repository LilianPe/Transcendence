import { Player } from "./Player.js";
import { BallObserver } from "./BallObserver.js";
import { AIMove, predictLandingY } from "../Offline/pongAiExecutor.js";

export class Ball {
    private x: number;
    private y: number;
    private dx: number;
    private dy: number;
    private speed: number;
    private maxSpeed: number;
    private angle: number;

    constructor() {
        this.x = 395;
        this.y = 395;
        this.dx = 1;
        this.dy = 1;
        this.speed = 9;
        this.maxSpeed = 14;
        this.angle = 0;
    }

    public move(p1: Player, p2: Player): void {
		const prevX = this.x;
		const prevY = this.y;
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
		const x = this.x;
		const y = this.y;

        if (this.y <= 0) {
            this.y = 0;
            this.dy = -this.dy;
        }
        if (this.y >= 800 - 10) {
            this.y = 800 - 10;
            this.dy = -this.dy;
        }

        if (
			collision(20, 30, p1.getY() - 10, p1.getY() + 100)
		) {
            this.x = 31;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p1.getY());
            let y = predictLandingY();
            AIMove(y);
        }

        if (
			collision(770, 780, p2.getY() - 10, p2.getY() + 100)
        ) {
            this.x = 769;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p2.getY());
            let y = predictLandingY();
            AIMove(y);
        }

        if (this.x <= -10) {
            p2.incrementScore();
            this.reset();
        }
        if (this.x >= 800) {
            p1.incrementScore();
            this.reset();
        }

		function collision(xmin: number, xmax: number, ymin: number, ymax: number): boolean { // prend les coordonnees du paddle
			
			// on definit les infos de la droite (AB) qui correspont a A(prevX, prevY) et B(this.x, this.y)
			const coeff: number = (y - prevY) / (x - prevX); // coeff directeur
			const originX: number = -(coeff * x - y); // equation de la droite : y = ax + b, on cherche b (originX)
			
			function collisionOnEdge(edgeX: number, edgeY: number, isVertical: boolean): boolean {
				if (isVertical) {
					if (Math.min(x, prevX) <= edgeX && edgeX <= Math.max(x, prevX)) {
						const yOnEdge: number = coeff * edgeX + originX;
						return (ymin <= yOnEdge && yOnEdge <= ymax);
					}
				}
				else {
					if (Math.min(y, prevY) <= edgeY && edgeY <= Math.max(y, prevY)) {
						const xOnEdge = (edgeY - originX) / coeff; // y = ax + b <=> (y - b) / a = x
						return (xmin <= xOnEdge && xOnEdge <= xmax)
					}
				}
				return false;
			}

			if (x == prevX) {
				return (xmin <= x && x <= xmax && Math.min(y, prevY) <= ymax && Math.max(y, prevY) >= ymin); // Si x est entre le debut et la fin du paddle en x et (que le plus petit des deux points est avant la fin du paddle et que le plus grand est apres le debut == la droite traverse le paddle en y) 
			}

			// verifie les 4 bords
			const collision: boolean = (collisionOnEdge(xmin, 0, true) || collisionOnEdge(xmax, 0, true) || collisionOnEdge(0, ymin, false) || collisionOnEdge(0, ymax, false));
			return collision;
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
        this.angle = Math.atan2(this.dy, this.dx);
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
    public getAngle(): number {
        return this.angle;
    }
    public getSpeed(): number {
        return this.speed;
    }
}
