
import { id, ws, hidePersonalsElements } from "../frontend.js";

// Sélectionner les éléments du DOM
const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
const messageInput = document.getElementById('messageInput') as HTMLInputElement;
const messageHistory = document.getElementById('messageHistory') as HTMLDivElement;

const close_button		= document.getElementById("profile_close") as HTMLButtonElement;
const invite_button		= document.getElementById("profile_invite") as HTMLButtonElement;
const block_button		= document.getElementById("profile_block") as HTMLButtonElement;
const unblock_button	= document.getElementById("profile_unblock") as HTMLButtonElement;

const greetingElement	= document.getElementById("greeting");

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

		message = "LIVECHAT/" + message;

		if (message.startsWith("LIVECHAT//profile"))
		{
			addMessageToHistory(message.slice(9));
		}

		// if (message.startsWith("LIVECHAT//join"))
		// {
		// 	addMessageToHistory(message.slice(9));
		// }

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

close_button.addEventListener('click', () =>
{
	hidePersonalsElements();
	window.scrollTo({
        top: 180,
        behavior: 'smooth'
    });
});

invite_button.addEventListener('click', () =>
{
	if (greetingElement && greetingElement.textContent)
	{
		let message = "/invite " + greetingElement.textContent;
		ws.send(message);
	}
});

block_button.addEventListener('click', () =>
{
	if (greetingElement && greetingElement.textContent)
	{
		let message = "/block " + greetingElement.textContent;
		ws.send(message);
	}
});

unblock_button.addEventListener('click', () =>
{
	if (greetingElement && greetingElement.textContent)
	{
		let message = "/unblock " + greetingElement.textContent;
		ws.send(message);
	}
});








