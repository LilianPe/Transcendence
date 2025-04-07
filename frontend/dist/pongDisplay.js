"use strict";
//@ts-ignore
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
function drawLeftPlayer(y, name) {
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "white";
    // console.log(`Left Player name: ${name}`);
    canvasContext.fillText(name, 175, 30);
    canvasContext.fillRect(20, y, 10, 100);
    canvasContext.strokeStyle = "black";
    canvasContext.strokeText(name, 175, 30);
}
function drawRightPlayer(y, name) {
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "white";
    // console.log(`Right Player name: ${name}`);
    canvasContext.fillText(name, 575, 30);
    canvasContext.fillRect(770, y, 10, 100);
    canvasContext.strokeStyle = "black";
    canvasContext.strokeText(name, 575, 30);
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
function displayLaunchError(message) {
    const errorMessage = document.getElementById("LaunchError");
    errorMessage.textContent = message;
    errorMessage.classList.remove("opacity-0");
    errorMessage.classList.add("opacity-100");
    setTimeout(() => {
        errorMessage.classList.remove("opacity-100");
        errorMessage.classList.add("opacity-0");
    }, 1000);
}
let currentState = null;
let targetState = null;
let lastUpdateTime = performance.now();
let id;
ws.onmessage = (event) => {
    const content = JSON.parse(event.data);
    if (content.type == "error") {
        displayLaunchError(content.error);
        return;
    }
    else if (content.type == "clientId") {
        id = content.clientId;
        console.log("My ID is: " + id);
    }
    else if (content.type == "state") {
        targetState = content.state;
        if (!currentState)
            currentState = { ...targetState };
    }
};
function lerp(start, end, alpha) {
    return start + (end - start) * alpha;
}
// render en 60 fps grace a requestAnimationFrame
// lerp sert a rendre le mouvement plus smooth
// plutot que d'aller de A a B, donne un nombre un peut avant B
// rend les mouvements plus fluides.
function render() {
    if (currentState && targetState) {
        const now = performance.now();
        const deltaTime = (now - lastUpdateTime) / (1000 / 60); // Normalisé à 60 FPS
        lastUpdateTime = now;
        const interpolationSpeed = 0.865; // Vitesse de base (ajustable)
        const alpha = Math.min(1, interpolationSpeed * deltaTime);
        // Interpolation
        currentState.ballX = lerp(currentState.ballX, targetState.ballX, alpha);
        currentState.ballY = lerp(currentState.ballY, targetState.ballY, alpha);
        currentState.player1Y = lerp(currentState.player1Y, targetState.player1Y, alpha);
        currentState.player2Y = lerp(currentState.player2Y, targetState.player2Y, alpha);
        // Dessin
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, 800, 800);
        displayLine();
        drawLeftPlayer(currentState.player1Y, targetState.player1Name);
        drawRightPlayer(currentState.player2Y, targetState.player2Name);
        displayScore(targetState.player1Score, targetState.player2Score);
        canvasContext.fillStyle = "white";
        canvasContext.fillRect(currentState.ballX, currentState.ballY, 10, 10);
    }
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
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
// gestion de l'envoie du formulaire
const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value;
    const response = await fetch("http://localhost:4500/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": id,
        },
        body: JSON.stringify({ username }),
    });
    const result = await response.json();
    console.log(result.message);
});
