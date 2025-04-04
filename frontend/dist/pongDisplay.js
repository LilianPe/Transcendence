// A mettre apres dans le frontend
const ws = new WebSocket("ws://localhost:4500/ws");
ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("Hello from the client!");
};
// ws.onmessage = (event) => {
//     console.log("Message received");
// };
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
ws.onmessage = (event) => {
    const state = JSON.parse(event.data);
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, 800, 800);
    oldx = state.ballX;
    oldy = state.ballY;
    drawLeftPlayer(state.player1Y);
    drawRightPlayer(state.player2Y);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(state.ballX, state.ballY, 10, 10);
};
// handle players movements
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
            ws.send("LU");
            break;
        case "s":
            ws.send("LD");
            break;
        case "j":
            ws.send("RU");
            break;
        case "n":
            ws.send("RD");
            break;
    }
});
export {};
