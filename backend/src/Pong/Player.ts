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
        this.y -= 10;
        if (this.y < 0) this.y = 0;
    }
    moveDown() {
        this.y += 10;
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
