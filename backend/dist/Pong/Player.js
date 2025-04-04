export class Player {
    constructor(name) {
        this.y = 400 - 50;
        this.score = 0;
        this.name = name;
    }
    moveUp() {
        this.y -= 10;
        if (this.y < 0)
            this.y = 0;
    }
    moveDown() {
        this.y += 10;
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
