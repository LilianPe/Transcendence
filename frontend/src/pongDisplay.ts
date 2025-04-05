// A mettre apres dans le frontend

export interface GameState {
    ballX: number;
    ballY: number;
    player1Y: number;
    player2Y: number;
    player1Score: number;
    player2Score: number;
}

const ws = new WebSocket("ws://localhost:4500/ws");

ws.onopen = () => {
    console.log("Connected to WebSocket server");

    ws.send("Hello from the client!");
};

ws.onerror = (error: Event) => console.error("WebSocket error:", error);

ws.onclose = (event: CloseEvent) => {
    console.log("WebSocket connection closed. Code:", event.code, "Reason:", event.reason);
};

let canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
console.log(canvas);
canvas.width = 800;
canvas.height = 800;
let canvasContext: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

let oldx: number;
let oldy: number;

function drawLeftPlayer(y: number): void {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(20, y, 10, 100);
    console.log("Right: " + y);
}

function drawRightPlayer(y: number): void {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(770, y, 10, 100);
}

function displayScore(s1: number, s2: number) {
    canvasContext.font = "100px Arial";
    canvasContext.strokeStyle = "white";
    canvasContext.strokeText("" + s1, 175, 400);
    canvasContext.strokeText("" + s2, 575, 400);
}

function displayLine(): void {
    canvasContext.fillStyle = "grey";
    canvasContext.fillRect(398, 0, 4, 800);
}

const launchButton: HTMLButtonElement = document.getElementById("Launch") as HTMLButtonElement;

launchButton.addEventListener("click", () => {
    ws.send("start");
});

function displayLaunchError(message: string) {
    const errorMessage: HTMLParagraphElement = document.getElementById(
        "LaunchError"
    ) as HTMLParagraphElement;
    if (message == "Already running") errorMessage.textContent = "A game is already running.";
    else if (message == "Not enought players")
        errorMessage.textContent = "Not enought players to launch.";
    else if (message == "Opponent disconected") errorMessage.textContent = "Opponent disconected.";
    errorMessage.classList.remove("opacity-0");
    errorMessage.classList.add("opacity-100");
    setTimeout(() => {
        errorMessage.classList.remove("opacity-100");
        errorMessage.classList.add("opacity-0");
    }, 1000);
}

ws.onmessage = (event) => {
    if (
        event.data.toString() == "Already running" ||
        event.data.toString() == "Not enought players" ||
        event.data.toString() == "Opponent disconected"
    ) {
        displayLaunchError(event.data.toString());
        return;
    }
    const state: GameState = JSON.parse(event.data);
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, 800, 800);
    oldx = state.ballX;
    oldy = state.ballY;
    displayLine();
    drawLeftPlayer(state.player1Y);
    drawRightPlayer(state.player2Y);
    displayScore(state.player1Score, state.player2Score);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(state.ballX, state.ballY, 10, 10);
};
// handle players movements

interface inputs {
    w: boolean;
    s: boolean;
    j: boolean;
    n: boolean;
}
const keys: inputs = {
    w: false,
    s: false,
    j: false,
    n: false,
};

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
            keys.w = true;
            break;
        case "s":
            keys.s = true;
            break;
        case "j":
            keys.j = true;
            break;
        case "n":
            keys.n = true;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "w":
            keys.w = false;
            break;
        case "s":
            keys.s = false;
            break;
        case "j":
            keys.j = false;
            break;
        case "n":
            keys.n = false;
            break;
    }
});

function updateMoves() {
    if (keys.w) ws.send("LU");
    if (keys.s) ws.send("LD");
    if (keys.j) ws.send("RU");
    if (keys.n) ws.send("RD");
    requestAnimationFrame(updateMoves);
}

// setInterval(updateMoves, 1000 / 60)
requestAnimationFrame(updateMoves);
