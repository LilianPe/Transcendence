interface GameState {
    ballX: number;
    ballY: number;
    player1Y: number;
    player2Y: number;
    player1Score: number;
    player2Score: number;
    player1Name: string;
    player2Name: string;
}

const ws = new WebSocket("wss://transcendence-h1wf.onrender.com/ws");

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

function drawLeftPlayer(y: number, name: string): void {
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "white";
    // console.log(`Left Player name: ${name}`);
    canvasContext.fillText(name, 175, 30);
    canvasContext.fillRect(20, y, 10, 100);
    canvasContext.strokeStyle = "black";
    canvasContext.strokeText(name, 175, 30);
}

function drawRightPlayer(y: number, name: string): void {
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "white";
    // console.log(`Right Player name: ${name}`);
    canvasContext.fillText(name, 575, 30);
    canvasContext.fillRect(770, y, 10, 100);
    canvasContext.strokeStyle = "black";
    canvasContext.strokeText(name, 575, 30);
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
    errorMessage.textContent = message;
    errorMessage.classList.remove("opacity-0");
    errorMessage.classList.add("opacity-100");
    setTimeout(() => {
        errorMessage.classList.remove("opacity-100");
        errorMessage.classList.add("opacity-0");
    }, 1000);
}

interface message {
    type: string;
    error: string;
    state: GameState;
    clientId: string;
}
let currentState: GameState | null = null;
let targetState: GameState | null = null;
let lastUpdateTime = performance.now();

let id: string;
ws.onmessage = (event) => {
    const content: message = JSON.parse(event.data);
    if (content.type == "error") {
        displayLaunchError(content.error);
        return;
    } else if (content.type == "clientId") {
        id = content.clientId;
        console.log("My ID is: " + id);
    } else if (content.type == "state") {
        targetState = content.state;
        if (!currentState) currentState = { ...targetState };
    }
};

function lerp(start: number, end: number, alpha: number): number {
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

// gestion de l'envoie du formulaire
const form: HTMLFormElement = document.getElementById("form") as HTMLFormElement;
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameInput: HTMLInputElement = document.getElementById("username") as HTMLInputElement;
    const username: string = usernameInput.value;


	const response = await fetch("https://transcendence-h1wf.onrender.com/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Client-Id": id,
		},
		body: JSON.stringify({username})
	});
	const result = await response.json();
	console.log(result.message)
})
