import { online } from "../events.js";
import { Ref, ws } from "../frontend.js";
import { addMessageToHistory } from "../Live_chat/Live_chat.js";
import { GameState } from "../Pong/Game.js";
import { displayLaunchError, displayNextMatch } from "./pongDisplayOnline.js";

import { show_profile } from "../frontend.js";

interface message {
    type: string;
    error: string;
    state: GameState;
    clientId: string;
    result: string;
    nextMatch: string;
	isBusy: string;
}
export let currentState: GameState | null = null;
export let targetState: GameState | null = null;
export let tournamentWinner: string | undefined;
function setWinner(winner: string) {
	tournamentWinner = winner;
	setTimeout(() => {
		tournamentWinner = undefined;
	}, 1000);
}

export function handleWebSocket(id: Ref<string>) {
	ws.onopen = () => {
		console.log("Connected to WebSocket server");
	
		ws.send("Hello from the client!");
	};
	
	ws.onerror = (error: Event) => console.error("WebSocket error:", error);
	
	ws.onclose = (event: CloseEvent) => {
		console.log("WebSocket connection closed. Code:", event.code, "Reason:", event.reason);
	};

	ws.onmessage = (event) => {
		const content: message = JSON.parse(event.data);
		if (content.type == "clientId") {
			id.value = content.clientId;
			console.log("My ID is: " + id.value);
		}
		if (content.type == "nextMatch") {
			displayNextMatch(content.nextMatch);
		}
		if (!online) return;
		if (content.type == "error") {
			displayLaunchError(content.error);
			return;
		} 
		 else if (content.type == "state") {
			targetState = content.state;
			if (!currentState) currentState = { ...targetState };
		}
		else if (content.type == "isBusy") {
			switchOffline(content.isBusy);
		}
		else if (content.type == "result") {
			console.log(content);
			setWinner(content.result);
		}
		else if (content.type == "LIVECHAT")
		{
			let message = content.error.toString();
			addMessageToHistory(message);
		}
		else if (content.type == "LIVECHAT_PROFILE")
		{
			const mail = content.error.toString();
			let message = "Showing the profile linked to : " + mail;
			if (content.error.toString().length === 0)
			{
				message = "Invalid username"
				addMessageToHistory(message);
				return;
			}

			addMessageToHistory(message);

			show_profile( mail );

		}
	};
}
