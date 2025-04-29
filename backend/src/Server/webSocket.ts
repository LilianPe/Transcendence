import { createLogEntry } from "../logger/logHelper.js";
import { logToELK } from "../logger/logToElk.js";
import { LogLevel, LogType } from "../logger/normalization.js";
// @ts-ignore
import fastifyWebsocket, { FastifyRequest, SocketStream } from "@fastify/websocket";
import { GameState } from "../Pong/Game.js";
import { Player } from "../Pong/Player.js";
import { app, clients, game, registeredClients } from "../server.js";

import { WebSocket } from "ws";

import * as DB from "../Database/requests.js";
import { Match } from "../Pong/Match.js";

import { Ref, Tournament } from "../Pong/Tournament.js";

const invitations: Map<number, number> = new Map<number, number>();

export interface Client {
	player: Player;
	socketStream: SocketStream;
}

export const registeredTournament: Map<string, Player> = new Map();


export function a_game_is_already_running(): boolean
{
	if (game.getGame() && (game.getSolo()))
	{
		return true;
	}
	return false;
}


function registerToTournament(id: string): void
{
	const client: Client | undefined = registeredClients.get(id);
	if (client)
	{
		if (registeredTournament.get(id))
		{
			clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "You are already registered."}));
		}
		else
		{
			const player: Player = client.player;
			registeredTournament.set(id, player);
			// player.register pour set le name a recuperer dans la database
		}
	}
	else
	{
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "You must be registered."}));
	}
}

function launchTournament(id: string): void
{
	if (game.getTournament().isLaunched())
	{
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "A tournament is already launched."}));
	}
	else if (registeredTournament.size < 2)
	{
		clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "Not enought player in tournament to launch."}));
	}
	else
	{
		if (a_game_is_already_running())
		{
			clients.get(id)?.socketStream.send(JSON.stringify({type: "error", error: "A game is already running."}));
			return ;
		}
		game.launchTournament(registeredTournament);
	}
}

function sendToClientSocket(clientID: string, type: string, error: string)
{
	clients.forEach((client) =>
	{
		if (client.socketStream.readyState === WebSocket.OPEN && client.player.getId() == clientID)
		{
			client.socketStream.send(JSON.stringify({type: type,error: error}));
		}
	});
}

function getPseudoFromClientID(clientID: string) : string
{
	let sender: string = clientID;
	let pseudo: string = "random";

	if (registeredClients.get( sender ))
	{
		let ref: Client = registeredClients.get( sender )!; // <-- le "!" dit à TS : "je te jure que c'est pas undefined"
		pseudo = ref.player.getName();
	}

	return pseudo;
}

function getClientFromPseudo(pseudo: string) : Client | null
{
	for (const client of registeredClients.values())
	{
		if (client.player.getName() === pseudo)
		{
			return client;
		}
	}
	return null;
}

function showProfile(clientID: string, message: string | Buffer<ArrayBufferLike>) : void
{
	const profile_pseudo = message.toString().split(" ")[1];
	DB.getUserFromDB(profile_pseudo, (player) =>
	{
		if (!player)
		{
			sendToClientSocket(clientID, "LIVECHAT_PROFILE", "");
			return;
		}

		DB.getMailFromId(player.getDBId(), (mail) =>
		{
			if (!mail)
			{
				sendToClientSocket(clientID, "LIVECHAT_PROFILE", "");
				return;
			}
			sendToClientSocket(clientID, "LIVECHAT_PROFILE", mail);
		});
	});
}

async function sendMSG(clientID: string, message: string | Buffer<ArrayBufferLike>) : Promise<void>
{
	let pseudo: string = getPseudoFromClientID( clientID );
	let mess: string = pseudo + " : " + message.toString().slice(9);

	let		sender_id: number = -1;
	const	sender = getClientFromPseudo( pseudo );
	if (sender)
	{
		sender_id = sender.player.getDBId();
	}

	// Broadcast à tous les clients connectés
	for (const client of clients.values())
	{
		if (client.socketStream.readyState === WebSocket.OPEN)
		{
			if (sender_id != -1 && sender)
			{
				const	receiver = client;
				const blocked = await DB.XhasBlockedY( receiver.player.getDBId(), sender.player.getDBId() );
				if (blocked)
				{
					continue;
				}
			}

			client.socketStream.send(JSON.stringify({type: "LIVECHAT", error: mess}));
		}
	};
}

async function invitePlayer(clientID: string, message: string | Buffer<ArrayBufferLike>) : Promise<void>
{
	let inviter_pseudo = getPseudoFromClientID( clientID );
	let invited_pseudo = message.toString().split(" ")[1];

	//! VERIF SI UNE GAME EST EN COURS

	const  inviter = getClientFromPseudo( inviter_pseudo );
	if (!inviter)
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before inviting people");
		return;
	}

	if (!registeredClients.get( clientID ))
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before inviting people");
		return;
	}

	const  invited = getClientFromPseudo( invited_pseudo );
	if (!invited)
	{
		const temp = invited_pseudo + " is not connected, can't invite him";
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (inviter_pseudo == invited_pseudo)
	{
		sendToClientSocket(clientID, "LIVECHAT", "You can't invite yourself");
		return;
	}

	const blocked = await DB.XhasBlockedY( invited.player.getDBId(), inviter.player.getDBId() );
	if (blocked)
	{
		const temp = invited_pseudo + " blocked you, can't invite him"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	const blocked2 = await DB.XhasBlockedY( inviter.player.getDBId(), invited.player.getDBId() );
	if (blocked2)
	{
		const temp = "Please unblock " + invited_pseudo + " before"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (invitations.get(inviter.player.getDBId()) == invited.player.getDBId())
	{
		const temp = "You already invited " + invited_pseudo;
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (game.getTournament().isLaunched())
	{
		sendToClientSocket(clientID, "LIVECHAT", "Wait until the current tournament is finished");
		return;
	}

	let mess = inviter_pseudo + " invited you to play pong ! Do /join " + inviter_pseudo + " to join him !"
	let mess2 = invited_pseudo + " has been invited to play pong !"

	sendToClientSocket( invited.player.getId(), "LIVECHAT", mess );
	sendToClientSocket( clientID, "LIVECHAT", mess2 );

	//* ICI LOGIQUE D'INVITATION ↓

	invitations.set(inviter.player.getDBId(), invited.player.getDBId());
}

async function tryJoin(clientID: string, message: string | Buffer<ArrayBufferLike>) : Promise<void>
{
	let joiner_pseudo = getPseudoFromClientID( clientID );
	let joined_pseudo = message.toString().split(" ")[1];

	const  joiner = getClientFromPseudo( joiner_pseudo );
	if (!joiner)
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before joining people");
		return;
	}

	const  joined = getClientFromPseudo( joined_pseudo );
	if (!joined)
	{
		const temp = "Invalid nickname, or " + joined_pseudo + " is not connected, can't join";
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (joiner.player.getDBId() == joined.player.getDBId())
	{
		sendToClientSocket(clientID, "LIVECHAT", "You can't join yourself");
		return;
	}

	if (!registeredClients.get( clientID ))
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before joining people");
		return;
	}

	if (!registeredClients.get( joined.player.getId() ))
	{
		const temp = joined_pseudo + " is not connected, can't join";
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	const blocked = await DB.XhasBlockedY( joined.player.getDBId(), joiner.player.getDBId() );
	if (blocked)
	{
		const temp = joined_pseudo + " blocked you, can't join :("
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (game.getTournament().isLaunched())
	{
		sendToClientSocket(clientID, "LIVECHAT", "Wait until the current tournament is finished");
		return;
	}

	if (a_game_is_already_running())
	{
		sendToClientSocket(clientID, "LIVECHAT", "Wait until the current game is finished");
	}

	const joiner_id = joiner.player.getDBId();
	const joined_id = joined.player.getDBId();

	//* ICI LOGIQUE DE JOIN ↓

	if (invitations.get(joined_id) == joiner_id)
	{
		let mess = "A game between " + joiner_pseudo + " and " + joined_pseudo + " will start, be ready !";
	
		sendToClientSocket( joiner.player.getId(), "LIVECHAT", mess );
		sendToClientSocket( joined.player.getId(), "LIVECHAT", mess );

		invitations.delete(joined.player.getDBId());

		let match: Ref<Match> = {value: new Match(joiner.player, joined.player, 0)};
		game.launchGame(match);
	}
	else
	{
		const temp = joined_pseudo + " didn't invite you, (maybe he invited someone else after), can't join :("
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}
}

async function tryBlockPlayer(clientID: string, message: string | Buffer<ArrayBufferLike>) : Promise<void>
{
	let blocker_pseudo = getPseudoFromClientID( clientID );
	let blocked_pseudo = message.toString().split(" ")[1];

	const  blocker = getClientFromPseudo( blocker_pseudo );
	if (!blocker)
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before blocking people");
		return;
	}

	const  blocked = getClientFromPseudo( blocked_pseudo );
	if (!blocked)
	{
		const temp = blocked_pseudo + " is not connected, wait before he is here to block him"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (!registeredClients.get( clientID ))
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before blocking people");
		return;
	}

	if (blocker_pseudo == blocked_pseudo)
	{
		sendToClientSocket(clientID, "LIVECHAT", "You can't block yourself");
		return;
	}

	const already_blocked = await DB.XhasBlockedY( blocker.player.getDBId(), blocked.player.getDBId() );
	if (already_blocked)
	{
		const temp = blocked_pseudo + " is already blocked"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	let mess = blocker_pseudo + " blocked you ://"
	let mess2 = blocked_pseudo + " has been blocked"

	sendToClientSocket( blocked.player.getId(), "LIVECHAT", mess );
	sendToClientSocket( clientID, "LIVECHAT", mess2 );

	await DB.BlockPlayer( blocker.player.getDBId(), blocked.player.getDBId() );
}

async function tryUnblockPlayer(clientID: string, message: string | Buffer<ArrayBufferLike>) : Promise<void>
{
	let blocker_pseudo = getPseudoFromClientID( clientID );
	let blocked_pseudo = message.toString().split(" ")[1];

	const  blocker = getClientFromPseudo( blocker_pseudo );
	if (!blocker)
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before unblocking people");
		return;
	}

	const  blocked = getClientFromPseudo( blocked_pseudo );
	if (!blocked)
	{
		const temp = blocked_pseudo + " is not connected, wait before he is here to unblock him"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	if (!registeredClients.get( clientID ))
	{
		sendToClientSocket(clientID, "LIVECHAT", "Please log in before unblocking people");
		return;
	}

	if (blocker_pseudo == blocked_pseudo)
	{
		sendToClientSocket(clientID, "LIVECHAT", "You can't unblock yourself");
		return;
	}

	const already_blocked = await DB.XhasBlockedY( blocker.player.getDBId(), blocked.player.getDBId() );
	if (!already_blocked)
	{
		const temp = blocked_pseudo + " is already not blocked"
		sendToClientSocket(clientID, "LIVECHAT", temp);
		return;
	}

	let mess = blocker_pseudo + " unblocked you :))"
	let mess2 = blocked_pseudo + " has been unblocked"

	sendToClientSocket( blocked.player.getId(), "LIVECHAT", mess );
	sendToClientSocket( clientID, "LIVECHAT", mess2 );

	await DB.UnblockPlayer( blocker.player.getDBId(), blocked.player.getDBId() );
}

export function handleWebsocket(): void {
	app.register(fastifyWebsocket, { options: { perMessageDeflate: true } });
	app.register(async function (fastify) {
		fastify.get("/ws", { websocket: true }, (socket: SocketStream, req: FastifyRequest) => {
			logToELK(createLogEntry(LogLevel.INFO, LogType.REQUEST, "🔌 WS Connected from " + req.ip));
			const clientID: string = crypto.randomUUID();
			const client: Client = {
				player: new Player(clientID),
				socketStream: socket
			}
			clients.set(clientID, client);
			socket.send(JSON.stringify({type: "clientId", clientId: clientID}));
			// console.log("Nouveau client connecte, ID: " + clientID);

			// debug websocket
			socket.on("message", (message: Buffer | string): void => {
				logToELK(
					createLogEntry(
						LogLevel.DEBUG,
						LogType.REQUEST,
						"📨 WS message: " + message.toString()
					)
				);
				console.log("Message reçu du client " + clientID + ": ", message.toString());
				if (message == "register") {
					registerToTournament(clientID);
				}
				if (message == "launch tournament") {
					launchTournament(clientID);
				}

				//. LIVE CHAT
				if (message.toString().startsWith("LIVECHAT/"))
				{
					if (message.toString().startsWith("LIVECHAT//profile"))
					{
						showProfile( clientID, message );
						return ;
					}
					if (message.toString().startsWith("LIVECHAT//join"))
					{
						tryJoin( clientID, message );
						return ;
					}
					sendMSG( clientID, message );
					return;
				}
				else if (message.toString().startsWith("/invite"))
				{
					invitePlayer( clientID, message );
					return;
				}
				else if (message.toString().startsWith("/block"))
				{
					tryBlockPlayer( clientID, message );
					return;
				}
				else if (message.toString().startsWith("/unblock"))
				{
					tryUnblockPlayer( clientID, message );
					return;
				}
				else // si c est un LIVE CHAT pas besoin
					game.update(message.toString(), clients, registeredTournament, clientID);
			});

			// Gérer les erreurs
			socket.on("error", (err: Buffer): void => {
				logToELK(createLogEntry(LogLevel.ERROR, LogType.RESPONSE, "💥 WS error: " + err));
				console.error("Erreur WebSocket:", err);
			});

			// Envoi des données du jeu au client

			const interval: NodeJS.Timeout = setInterval((): void => {
				const state: GameState = game.getState();
				socket.send(JSON.stringify({type: "state", state: state}));
			}, 1000 / 30);

			// Gérer la fermeture de la connexion WebSocket
			socket.on("close", (code: number, reason: Buffer) => {
				logToELK(
					createLogEntry(
						LogLevel.INFO,
						LogType.RESPONSE,
						"👋 WS connection closed. code:" + code + ", reason:" + reason.toString()
					)
				);
				game.check(clients, clientID);
				if (registeredClients.get(clientID)) registeredClients.delete(clientID);
				clients.delete(clientID);
				console.log("Client déconnecté, code:", code, "raison:", reason.toString());
				clearInterval(interval);
			});
		});
	});
}
