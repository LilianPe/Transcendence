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
        if (collision(20, 30, p1.getY() - 10, p1.getY() + 100)
        // this.x <= 30 && this.x >= 20 && this.y > p1.getY() - 10 && this.y < p1.getY() + 100
        ) {
            this.x = 31;
            this.dx = -this.dx;
            this.adjustSpeed();
            this.adjustAngle(p1.getY());
        }
        if (collision(770, 780, p2.getY() - 10, p2.getY() + 100)
        // this.x + 10 >= 770 &&
        // this.x + 10 <= 780 &&
        // this.y > p2.getY() - 10 &&
        // this.y < p2.getY() + 100
        ) {
            this.x = 769;
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
        function collision(xmin, xmax, ymin, ymax) {
            // on definit les infos de la droite (AB) qui correspont a A(prevX, prevY) et B(this.x, this.y)
            const coeff = (y - prevY) / (x - prevX); // coeff directeur
            const originX = -(coeff * x - y); // equation de la droite : y = ax + b, on cherche b (originX)
            function collisionOnEdge(edgeX, edgeY, isVertical) {
                if (isVertical) {
                    if (Math.min(x, prevX) <= edgeX && edgeX <= Math.max(x, prevX)) {
                        const yOnEdge = coeff * edgeX + originX;
                        return (ymin <= yOnEdge && yOnEdge <= ymax);
                    }
                }
                else {
                    if (Math.min(y, prevY) <= edgeY && edgeY <= Math.max(y, prevY)) {
                        const xOnEdge = (edgeY - originX) / coeff; // y = ax + b <=> (y - b) / a = x
                        return (xmin <= xOnEdge && xOnEdge <= xmax);
                    }
                }
                return false;
            }
            if (x == prevX) {
                return (xmin <= x && x <= xmax && Math.min(y, prevY) <= ymax && Math.max(y, prevY) >= ymin); // Si x est entre le debut et la fin du paddle en x et (que le plus petit des deux points est avant la fin du paddle et que le plus grand est apres le debut == la droite traverse le paddle en y) 
            }
            // verifie les 4 bords
            const collision = (collisionOnEdge(xmin, 0, true) || collisionOnEdge(xmax, 0, true) || collisionOnEdge(0, ymin, false) || collisionOnEdge(0, ymax, false));
            return collision;
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
