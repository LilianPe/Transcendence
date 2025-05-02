import { handleKeyPress, keys, launchButtonAddEvent, launchTournamentButtonAddEvent, online, onlineButtonAddEvent, playerAiButtonAddEvent, registerTournamentButtonAddEvent } from "./events.js";
import { PlayerType } from "./Offline/interfaces.js";
import { game, offMove } from "./Offline/offlineManager.js";
import { displayLine as displayLineOff, displayScore as displayScoreOff, drawLeftPlayer as drawLeftPlayerOff, drawRightPlayer as drawRightPlayerOff } from "./Offline/pongDisplayOff.js";
import { displayLaunchError, displayLine, displayScore, displayWinner, drawLeftPlayer, drawRightPlayer } from "./Online/pongDisplayOnline.js";
import { currentState, handleWebSocket, targetState, tournamentWinner } from "./Online/webSocket.js";
import { GameState } from "./Pong/Game.js";
import { PlayerMoves } from "./Pong/Player.js";

const logout_button = document.getElementById("logout") as HTMLButtonElement;
const greeting = document.getElementById("greeting") as HTMLParagraphElement;
const avatar_upload = document.getElementById("avatar-upload") as HTMLInputElement;

const close_button		= document.getElementById("profile_close") as HTMLButtonElement;
const invite_button		= document.getElementById("profile_invite") as HTMLButtonElement;
const block_button		= document.getElementById("profile_block") as HTMLButtonElement;
const unblock_button	= document.getElementById("profile_unblock") as HTMLButtonElement;

export type Ref<T> = {value: T};

// WebSocket connection
export const ws: WebSocket = new WebSocket("wss://localhost:4500/ws");
export const id: Ref<string> = {value: ""}; 
handleWebSocket(id);

// Canvas
let canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 800;
export let canvasContext: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;


export const onOffButton: HTMLButtonElement = document.getElementById("onOffButton") as HTMLButtonElement;
export const playerAi: HTMLButtonElement = document.getElementById("PlayerAi") as HTMLButtonElement;
export let currentPlayerOff: PlayerType = PlayerType.Player2;
export function setCurrentPlayerOff(type: PlayerType) {
	currentPlayerOff = type;
}
onlineButtonAddEvent();
playerAiButtonAddEvent();

export const launchButton: HTMLButtonElement = document.getElementById("Launch") as HTMLButtonElement;
launchButtonAddEvent();

export const registerTournamentButton: HTMLButtonElement = document.getElementById("RegisterTournament") as HTMLButtonElement;
registerTournamentButtonAddEvent();

export const launchTournamentButton: HTMLButtonElement = document.getElementById("LaunchTournament") as HTMLButtonElement;
launchTournamentButtonAddEvent();


export const errorMessage: HTMLParagraphElement = document.getElementById(
	"LaunchError"
) as HTMLParagraphElement;

let lastUpdateTime: number = performance.now();

function lerp(start: number, end: number, alpha: number): number {
    return start + (end - start) * alpha;
}

// render en 60 fps grace a requestAnimationFrame
// lerp sert a rendre le mouvement plus smooth
// plutot que d'aller de A a B, donne un nombre un peut avant B
// rend les mouvements plus fluides.

function render(): void {
	if (!online) {
        const currentState: GameState = game.getState();
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, 800, 800);
        displayLineOff(canvasContext);
        drawLeftPlayerOff(currentState.player1Y, canvasContext);
        drawRightPlayerOff(currentState.player2Y, canvasContext);
        displayScoreOff(currentState.player1Score, currentState.player2Score, canvasContext);
        canvasContext.fillStyle = "white";
        canvasContext.fillRect(currentState.ballX, currentState.ballY, 10, 10);
	}
    else if (currentState && targetState) {
        const now: number = performance.now();
        const deltaTime: number = (now - lastUpdateTime) / (1000 / 60); // Normalisé à 60 FPS
        lastUpdateTime = now;

        const interpolationSpeed: number = 0.865; // Vitesse de base (ajustable)
        const alpha: number = Math.min(1, interpolationSpeed * deltaTime);
        // Interpolation
        currentState.ballX = lerp(currentState.ballX, targetState.ballX, alpha);
        currentState.ballY = lerp(currentState.ballY, targetState.ballY, alpha);
        currentState.player1Y = lerp(currentState.player1Y, targetState.player1Y, alpha);
        currentState.player2Y = lerp(currentState.player2Y, targetState.player2Y, alpha);

        // Dessin
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, 800, 800);
        displayLine();
		if (tournamentWinner)
        	displayWinner(tournamentWinner);
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
function updateMoves(): void {
	if (online) {
		if (keys.w) ws.send(PlayerMoves.MoveUp);
		if (keys.s) ws.send(PlayerMoves.MoveDown);
	} 
	else {
		if (keys.w) offMove(PlayerType.Player, PlayerMoves.MoveUp);
		if (keys.s) offMove(PlayerType.Player, PlayerMoves.MoveDown);
		if (keys.j) offMove(PlayerType.Player2, PlayerMoves.MoveUp);
		if (keys.n) offMove(PlayerType.Player2, PlayerMoves.MoveDown);
	}
    requestAnimationFrame(updateMoves);
}

// setInterval(updateMoves, 1000 / 60)
requestAnimationFrame(updateMoves);

const signupForm: HTMLFormElement = document.getElementById("signup-form") as HTMLFormElement;
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pseudoInput: HTMLInputElement = document.getElementById("PseudoIncription") as HTMLInputElement;
    const mailInput: HTMLInputElement = document.getElementById("EmailIncription") as HTMLInputElement;
    const passwordInput: HTMLInputElement = document.getElementById("PasswordIncription") as HTMLInputElement;
    const pseudo: string = pseudoInput.value;
    const mail: string = mailInput.value;
    const password: string = passwordInput.value;
    
    const response = await fetch("https://localhost:4500/inscription", {
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

    const response = await fetch("https://localhost:4500/connexion", {
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
        const userProfile = document.getElementById("user-profile");
        if (forms && userProfile)
        {
            forms.style.display = "none";
            userProfile.style.display = "block";
        }
		const close_button		= document.getElementById("profile_close");
		const invite_button		= document.getElementById("profile_invite");
		const block_button		= document.getElementById("profile_block");
		const unblock_button	= document.getElementById("profile_unblock");
	
		if (close_button && invite_button && block_button && unblock_button)
		{
			close_button.style.display		= "block";
			invite_button.style.display		= "none";	
			block_button.style.display		= "none";
			unblock_button.style.display	= "none";
		}

        printPersonalsElements(mail);
    }
    else
    {
        displayLaunchError(result.message);
    }
    console.log(result.message);
});

export async function printPersonalsElements(mail: string)
{
    const response = await fetch("https://localhost:4500/info", {
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
    const avatarElement = document.getElementById("user-avatar") as HTMLImageElement;

	const emailElementline = document.getElementById("email-line");
	const victoriesElementline = document.getElementById("victories-line");
	const defeatsElementline = document.getElementById("defeats-line");

	if (emailElementline)		emailElementline.style.display = "block";
	if (victoriesElementline)	victoriesElementline.style.display = "block";
	if (defeatsElementline)		defeatsElementline.style.display = "block";
	if (avatar_upload)			avatar_upload.style.display = "block";
	if (avatarElement)			avatarElement.style.display = "block";	

	if (greetingElement)		greetingElement.style.display = "block";
	// if (emailElement)			emailElement.style.display = "block";
	// if (victoriesElement)		victoriesElement.style.display = "block";
	// if (defeatsElement)			defeatsElement.style.display = "block";
	if (avatarElement)			avatarElement.style.display = "block";

    if (greetingElement)
        greetingElement.textContent = `Hi ${result.pseudo} !`;
    if (emailElement)
        emailElement.textContent = result.mail;
    if (victoriesElement)
        victoriesElement.textContent = result.victories;
    if (defeatsElement)
        defeatsElement.textContent = result.defeats;
    if (avatarElement && result.avatar)
        avatarElement.src = result.avatar;
};

export async function show_profile( mail: string )
{
	hidePersonalsElements();

	const forms = document.getElementById("Forms-connexion");
	const formPseudo = document.getElementById("form");
	const userProfile = document.getElementById("user-profile");
	if (forms && formPseudo && userProfile)
	{
		forms.style.display = "none";
		formPseudo.style.display = "none";
		userProfile.style.display = "block";
	}
	await printPersonalsElements(mail);

	const close_button		= document.getElementById("profile_close");
	const invite_button		= document.getElementById("profile_invite");
	const block_button		= document.getElementById("profile_block");
	const unblock_button	= document.getElementById("profile_unblock");

	if (close_button && invite_button && block_button && unblock_button)
	{
		close_button.style.display		= "block";
		invite_button.style.display		= "block";	
		block_button.style.display		= "block";
		unblock_button.style.display	= "block";
	}

	const avatar_upload = document.getElementById("avatar-upload") as HTMLInputElement;
	const greetingElement = document.getElementById("greeting");
	if (avatar_upload)			avatar_upload.style.display = "none";
	if (greetingElement)
	{
		greetingElement.style.display = "block";
		if (greetingElement.textContent) greetingElement.textContent = greetingElement.textContent.slice(3, -2);
	}

	window.scrollTo({
		top: document.documentElement.scrollHeight,
		behavior: 'smooth'
	});
}

export function hidePersonalsElements()
{
	const greetingElement = document.getElementById("greeting");

	const emailElementline = document.getElementById("email-line");
	const victoriesElementline = document.getElementById("victories-line");
	const defeatsElementline = document.getElementById("defeats-line");

	const avatarElement = document.getElementById("user-avatar") as HTMLImageElement;

	if (greetingElement) greetingElement.style.display = "none";
	if (emailElementline) emailElementline.style.display = "none";
	if (victoriesElementline) victoriesElementline.style.display = "none";
	if (defeatsElementline) defeatsElementline.style.display = "none";
	if (avatarElement) avatarElement.style.display = "none";

	if (logout_button)     logout_button.style.display = "none";
	if (greeting)          greeting.style.display = "none";
	if (avatar_upload)     avatar_upload.style.display = "none";
	if (close_button)      close_button.style.display = "none";
	if (invite_button)     invite_button.style.display = "none";

	if (block_button)      block_button.style.display = "none";
	if (unblock_button)    unblock_button.style.display = "none";

	const forms = document.getElementById("Forms-connexion");
	if (forms)		   forms.style.display = "flex";	
}

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
            const emailElement = document.getElementById("user-email");
            const email = emailElement ? emailElement.textContent : "";
            if (!email)
                return;
            const base64Image = await convertFileToBase64(file);
            const requestBody = {
                avatar: base64Image,
                mail: email,
            };
            const response = await fetch("https://localhost:4500/upload-avatar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Client-Id": id.value,
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
    else
    {
        displayLaunchError("MUST BE A PNG FILE");
    }
});

document.getElementById("logout")?.addEventListener("click", function() {
    location.reload();
});