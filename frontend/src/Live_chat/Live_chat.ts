
import { id, ws } from "../frontend.js";

// Sélectionner les éléments du DOM
const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
const messageInput = document.getElementById('messageInput') as HTMLInputElement;
const messageHistory = document.getElementById('messageHistory') as HTMLDivElement;

// Fonction pour ajouter un message à l'historique
export function addMessageToHistory(message: string): void
{
	const messageElement = document.createElement('div');
	messageElement.textContent = `${message}`;
	messageHistory.appendChild(messageElement);
	// Scroll vers le bas après l'ajout d'un nouveau message
	messageHistory.scrollTop = messageHistory.scrollHeight;
}

// Fonction pour gérer l'envoi de message
function sendMessage(): void
{
	let message = messageInput.value.trim();
	if (message)
	{
		messageInput.value = ''; // Effacer le champ de saisie après l'envoi

		message = "LIVECHAT/" + id.value + ": " + message;
		ws.send(message);
	}
}

// Ajouter un événement au bouton Send
sendButton.addEventListener('click', sendMessage);

// Ajouter un événement au champ de saisie pour envoyer le message avec Enter
messageInput.addEventListener('keypress', (event) =>
{
	if (event.key === 'Enter')
	{
		sendMessage();
	}
});
