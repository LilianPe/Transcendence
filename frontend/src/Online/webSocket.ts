import { online } from "../events.js";
import { Ref, ws } from "../frontend.js";
import { GameState } from "../Pong/Game.js";
import { displayLaunchError } from "./pongDisplayOnline.js";

import { addMessageToHistory } from "../Live_chat/Live_chat.js";

interface message {
    type: string;
    error: string;
    state: GameState;
    clientId: string;
}
export let currentState: GameState | null = null;
export let targetState: GameState | null = null;
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
		if (!online) return;
		if (content.type == "error") {
			displayLaunchError(content.error);
			return;
		} 
		 else if (content.type == "state") {

			targetState = content.state;
			if (!currentState) currentState = { ...targetState };
		}
		else if (content.type == "LIVECHAT")
		{
			let message = content.error.toString().slice(9); // cut LIVECHAT/
			addMessageToHistory(message);
		}
	};
}