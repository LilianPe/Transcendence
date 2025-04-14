import { handleKeyPress, keys, launchButtonAddEvent, launchTournamentButtonAddEvent, online, onlineButtonAddEvent, registerTournamentButtonAddEvent } from "./events.js";
import { offMove, renderLocal } from "./Offline/pongAi.js";
import { displayLaunchError, displayLine, displayScore, drawLeftPlayer, drawRightPlayer } from "./Online/pongDisplayOnline.js";
import { currentState, handleWebSocket, targetState } from "./Online/webSocket.js";
import { PlayerMoves } from "./Pong/Player.js";

export type Ref<T> = {value: T};

// WebSocket connection
export const ws = new WebSocket("ws://localhost:4500/ws");
const id: Ref<string> = {value: ""}; 
handleWebSocket(id);

// Canvas
let canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 800;
export let canvasContext: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;


export const onOffButton: HTMLButtonElement = document.getElementById("onOffButton") as HTMLButtonElement;
onlineButtonAddEvent();

export const launchButton: HTMLButtonElement = document.getElementById("Launch") as HTMLButtonElement;
launchButtonAddEvent();

export const registerTournamentButton: HTMLButtonElement = document.getElementById("RegisterTournament") as HTMLButtonElement;
registerTournamentButtonAddEvent();

export const launchTournamentButton: HTMLButtonElement = document.getElementById("LaunchTournament") as HTMLButtonElement;
launchTournamentButtonAddEvent();


export const errorMessage: HTMLParagraphElement = document.getElementById(
	"LaunchError"
) as HTMLParagraphElement;

let lastUpdateTime = performance.now();

function lerp(start: number, end: number, alpha: number): number {
    return start + (end - start) * alpha;
}

// render en 60 fps grace a requestAnimationFrame
// lerp sert a rendre le mouvement plus smooth
// plutot que d'aller de A a B, donne un nombre un peut avant B
// rend les mouvements plus fluides.

function render(): void {
	if (!online) {
		renderLocal(canvasContext);
	}
    else if (currentState && targetState) {
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

handleKeyPress();
function updateMoves() {
	if (online) {
		if (keys.w) ws.send(PlayerMoves.MoveUp);
		if (keys.s) ws.send(PlayerMoves.MoveDown);
	} 
	else {
		if (keys.w) offMove(PlayerMoves.MoveUp);
		if (keys.s) offMove(PlayerMoves.MoveDown);
	}
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

    const response = await fetch("http://localhost:4500/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": id.value,
        },
        body: JSON.stringify({ username }),
    });
    const result = await response.json();
    console.log(result.message);
});

const signupForm: HTMLFormElement = document.getElementById("signup-form") as HTMLFormElement;
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pseudoInput: HTMLInputElement = document.getElementById("PseudoIncription") as HTMLInputElement;
    const mailInput: HTMLInputElement = document.getElementById("EmailIncription") as HTMLInputElement;
    const passwordInput: HTMLInputElement = document.getElementById("PasswordIncription") as HTMLInputElement;
    const pseudo: string = pseudoInput.value;
    const mail: string = mailInput.value;
    const password: string = passwordInput.value;

    const response = await fetch("http://localhost:4500/inscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": id.value,
        },
        body: JSON.stringify({ pseudo, mail, password }),
    });
    const result = await response.json();
    console.log(result.message);
});

const signinForm: HTMLFormElement = document.getElementById("signin-form") as HTMLFormElement;
signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mailInput: HTMLInputElement = document.getElementById("EmailConnexion") as HTMLInputElement;
    const passwordInput: HTMLInputElement = document.getElementById("PasswordConnexion") as HTMLInputElement;
    const mail: string = mailInput.value;
    const password: string = passwordInput.value;

    const response = await fetch("http://localhost:4500/connexion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": id.value,
        },
        body: JSON.stringify({ mail, password }),
    });
    const result = await response.json();
    if (result.message === "OK")
    {
        const forms = document.getElementById("Forms-connexion");
        const formPseudo = document.getElementById("form");
        const userProfile = document.getElementById("user-profile");
        if (forms && formPseudo && userProfile)
        {
            forms.style.display = "none";
            formPseudo.style.display = "none";
            userProfile.style.display = "block";
        }
        printPersonalsElements(mail);
    }
    else
    {
        displayLaunchError(result.message);
    }
    console.log(result.message);
});

async function printPersonalsElements(mail: string)
{
    const response = await fetch("http://localhost:4500/info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": id.value,
        },
        body: JSON.stringify({ mail }),
    });
    const result = await response.json();
    const greetingElement = document.getElementById("greeting");
    const emailElement = document.getElementById("user-email");
    const victoriesElement = document.getElementById("user-victories");
    const defeatsElement = document.getElementById("user-defeats");
    
    if (greetingElement)
        greetingElement.textContent = `Hi ${result.pseudo} !`;
    if (emailElement)
        emailElement.textContent = result.mail;
    if (victoriesElement)
        victoriesElement.textContent = result.victories;
    if (defeatsElement)
        defeatsElement.textContent = result.defeats;
};

function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const avatarInput = document.getElementById("avatar-upload") as HTMLInputElement;
avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (file && file.type === 'image/png') {
        try {
            const base64Image = await convertFileToBase64(file);
            const requestBody = {
                avatar: base64Image,
            };

            const mailInput = document.getElementById("user-email") as HTMLInputElement;
            const response = await fetch("http://localhost:4500/upload-avatar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Client-Id": id.value,
                    "Mail": mailInput.value,
                },
                body: JSON.stringify(requestBody),
            });

            console.log("Réponse reçue :", response);
            const result = await response.json();

            if (response.ok && result.message === "OK") {
                console.log("Avatar uploaded");
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la requête :", error);
        }
    }
});

document.getElementById("logout")?.addEventListener("click", function() {
    location.reload();
});