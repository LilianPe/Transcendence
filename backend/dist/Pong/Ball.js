export class Ball {
    constructor() {
        this.x = 395;
        this.y = 395;
        this.dx = 1;
        this.dy = 1;
        this.speed = 9;
        this.maxSpeed = 14;
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
        if (this.x <= 30 && this.x >= 20 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100) {
            this.x = 30;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p1.getY());
        }
        if (this.x + 10 >= 770 &&
            this.x + 10 <= 780 &&
            this.y > p2.getY() - 10 &&
            this.y < p2.getY() + 100) {
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
        this.x = 395;
        this.y = 395;
        this.dx = this.dx > 0 ? -1 : 1;
        this.dy = Math.random() * 2 - 1;
        this.speed = 9;
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
