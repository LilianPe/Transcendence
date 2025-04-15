import { getUserFromDB } from "../Database/requests.js";
export class Player {
    constructor(id) {
        this.y = 400 - 50;
        this.score = 0;
        this.name = "";
        this.id = id;
        this.registered = false;
        this.DB_ID = -1;
    }
    register(username) {
        this.name = username;
        // console.log(`Set name at: ${this.name}`)
        getUserFromDB(username, (player) => {
            if (player)
                this.DB_ID = player.DB_ID;
        });
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
    setTournamentID(id) {
        this.tournamentId = id;
    }
    getTournamentID() {
        return this.tournamentId;
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
    getDBId() {
        return this.DB_ID;
    }
}
