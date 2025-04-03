// A mettre apres dans le frontend

interface GameState {
    ballX: number;
    ballY: number;
}

const ws = new WebSocket("ws://transcendence42.duckdns.org:4500/ws");

ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("Hello from the client!");
};

// ws.onmessage = (event) => {
//     console.log("Message received");
// };

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

ws.onmessage = (event) => {
    const state: GameState = JSON.parse(event.data);
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, 800, 800);
    oldx = state.ballX;
    oldy = state.ballY;
    console.log("x: ", oldx, "y: ", oldy);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(state.ballX, state.ballY, 10, 10);
};
