// A mettre apres dans le frontend
const ws = new WebSocket("ws://localhost:4500/ws");
ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("Hello from the client!");
};
ws.onerror = (error) => console.error("WebSocket error:", error);
ws.onclose = (event) => {
    console.log("WebSocket connection closed. Code:", event.code, "Reason:", event.reason);
};
let canvas = document.querySelector("canvas");
console.log(canvas);
canvas.width = 800;
canvas.height = 800;
let canvasContext = canvas.getContext("2d");
let oldx;
let oldy;
function drawLeftPlayer(y) {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(20, y, 10, 100);
    console.log("Right: " + y);
}
function drawRightPlayer(y) {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(770, y, 10, 100);
}
function displayScore(s1, s2) {
    canvasContext.font = "100px Arial";
    canvasContext.strokeStyle = "white";
    canvasContext.strokeText("" + s1, 175, 400);
    canvasContext.strokeText("" + s2, 575, 400);
}
function displayLine() {
    canvasContext.fillStyle = "grey";
    canvasContext.fillRect(398, 0, 4, 800);
}
const launchButton = document.getElementById("Launch");
launchButton.addEventListener("click", () => {
    ws.send("start");
});
ws.onmessage = (event) => {
    if (event.data.toString() == "Already running") {
        //console.log("Already running");
        const errorMessage = document.getElementById("LaunchError");
        errorMessage.classList.remove("opacity-0");
        errorMessage.classList.add("opacity-100");
        setTimeout(() => {
            errorMessage.classList.remove("opacity-100");
            errorMessage.classList.add("opacity-0");
        }, 1000);
        return;
    }
    const state = JSON.parse(event.data);
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
const keys = {
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
    if (keys.w)
        ws.send("LU");
    if (keys.s)
        ws.send("LD");
    if (keys.j)
        ws.send("RU");
    if (keys.n)
        ws.send("RD");
    requestAnimationFrame(updateMoves);
}
// setInterval(updateMoves, 1000 / 60)
requestAnimationFrame(updateMoves);
export {};
