export const enum PlayerMoves {
	MoveUp = "Up",
	MoveDown = "Down",
}

export class Player {
    private y: number;
    private score: number;
    private name: string;
	private registered: boolean;

    constructor() {
        this.y = 400 - 50;
        this.score = 0;
        this.name = "";
        this.registered = false;
    }
	public register(username: string): void {
		this.name = username;
		// console.log(`Set name at: ${this.name}`)
		this.registered = true;
	}
	public reset(): void {
		this.y = 350;
		this.score = 0;
	}
    public moveUp(): void {
        this.y -= 10;
        if (this.y < 0) this.y = 0;
    }
    public moveDown(): void {
        this.y += 10;
        if (this.y > 700) this.y = 700;
    }
    public getY(): number {
        return this.y;
    }
    public getScore(): number {
        return this.score;
    }
    public incrementScore(): void {
        this.score++;
    }
    public getName(): string {
        return this.name;
    }
    public isRegistered(): boolean {
        return this.registered;
    }
}
