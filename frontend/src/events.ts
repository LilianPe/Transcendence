import { launchButton, launchTournamentButton, onOffButton, playerAi, registerTournamentButton, setCurrentPlayerOff, ws } from "./frontend.js";
import { PlayerType } from "./Offline/interfaces.js";
import { game, offReset, offStart, stopOff } from "./Offline/offlineManager.js";
import { displayLaunchError } from "./Online/pongDisplayOnline.js";

export let online: boolean = true;
export function onlineButtonAddEvent(): void {
	onOffButton.addEventListener("click", () => {
		if (onOffButton.textContent == "Play Offline") {
			online = false;
			playerAi.classList.remove("hidden");
			onOffButton.textContent = "Play Online";
			offReset();
			console.log("Playing offline");
		} 
		else {
			online = true;
			playerAi.classList.add("hidden");
			onOffButton.textContent = "Play Offline";
			stopOff();
			console.log("Playing online");
		}
	}); 
}

export function playerAiButtonAddEvent(): void {
	playerAi.addEventListener("click", () => {
		if (game.getGame().getRound().isRunning()) {
			displayLaunchError("Can't switch during a game.");
			return ;
		}
		if (playerAi.textContent == "Player") {
			playerAi.textContent = "Ai";
			setCurrentPlayerOff(PlayerType.Ai);
		}
		else {
			playerAi.textContent = "Player";
			setCurrentPlayerOff(PlayerType.Player2);
		}
	} )
}

export function launchButtonAddEvent(): void {
	launchButton.addEventListener("click", () => {
		if (online) {
			ws.send("start");
		}
		else {
			offStart();
		}
	});
}

export function registerTournamentButtonAddEvent(): void {
	registerTournamentButton.addEventListener("click", () => {
		if (online) {
			ws.send("register");
		}
	});
}

export function launchTournamentButtonAddEvent(): void {
	launchTournamentButton.addEventListener("click", () => {
		if (online) {
			ws.send("launch tournament");
		}
	});
}

interface inputs {
	w: boolean;
	s: boolean;
	j: boolean;
	n: boolean;
}
export const keys: inputs = {
	w: false,
	s: false,
	j: false,
	n: false,
};

export function handleKeyPress(): void {
	
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
}