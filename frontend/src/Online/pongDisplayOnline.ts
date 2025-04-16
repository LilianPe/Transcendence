import { canvasContext, errorMessage } from "../frontend.js";

export function drawLeftPlayer(y: number, name: string): void {
	canvasContext.font = "20px Arial";
	canvasContext.fillStyle = "white";
	// console.log(`Left Player name: ${name}`);
	canvasContext.fillText(name, 175, 30);
	canvasContext.fillRect(20, y, 10, 100);
	canvasContext.strokeStyle = "black";
	canvasContext.strokeText(name, 175, 30);
}

export function drawRightPlayer(y: number, name: string): void {
	canvasContext.font = "20px Arial";
	canvasContext.fillStyle = "white";
	// console.log(`Right Player name: ${name}`);
	canvasContext.fillText(name, 575, 30);
	canvasContext.fillRect(770, y, 10, 100);
	canvasContext.strokeStyle = "black";
	canvasContext.strokeText(name, 575, 30);
}

export function displayScore(s1: number, s2: number) {
	canvasContext.font = "100px Arial";
	canvasContext.strokeStyle = "white";
	canvasContext.strokeText("" + s1, 175, 400);
	canvasContext.strokeText("" + s2, 575, 400);
}

export function displayLine(): void {
	canvasContext.fillStyle = "grey";
	canvasContext.fillRect(398, 0, 4, 800);
}

export function displayLaunchError(message: string) {
	errorMessage.textContent = message;
	errorMessage.classList.remove("opacity-0");
	errorMessage.classList.add("opacity-100");
	setTimeout(() => {
		errorMessage.classList.remove("opacity-100");
		errorMessage.classList.add("opacity-0");
	}, 1000);
}

export function displayWinner(winner: string) {
	canvasContext.font = "50px Arial";
	canvasContext.strokeStyle = "white";
	canvasContext.strokeText("Tournament winner: " + winner, 100, 200);
	// a revoir, les infos sont bien recues mais l'affichage ne marche pas
}

const nextMatchP: HTMLParagraphElement = document.getElementById("nextMatch") as HTMLParagraphElement;
export function displayNextMatch(content: string) {
	nextMatchP.textContent = content;
}