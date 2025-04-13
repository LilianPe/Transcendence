export class Player {
    private y: number;
    private score: number;
    private name: string;
    private id: string;
	private registered: boolean;
	private tournamentId: number | undefined;

    constructor(id: string) {
        this.y = 400 - 50;
        this.score = 0;
        this.name = "";
        this.id = id;
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

	public setTournamentID(id: number): void {
		this.tournamentId = id;
	}
	public getTournamentID(): number | undefined {
		return this.tournamentId;
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
    public getId(): string {
        return this.id;
    }
    public getName(): string {
        return this.name;
    }
    public isRegistered(): boolean {
        return this.registered;
    }
}
