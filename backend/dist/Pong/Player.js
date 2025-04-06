export class Player {
    constructor(id) {
        this.y = 400 - 50;
        this.score = 0;
        this.name = "";
        this.id = id;
        this.registered = false;
    }
    register(username) {
        this.name = username;
        // console.log(`Set name at: ${this.name}`)
        this.registered = true;
    }
    reset() {
        this.y = 350;
        this.score = 0;
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
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    isRegistered() {
        return this.registered;
    }
}
