import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import { promises } from 'fs';
import type { ServerOptions } from "https";
import { join } from 'path';
import { checkUserID, checkUserMAIL, createUser, getAvatar, getDefeats, getPseudo, getVictories, setAvatar } from './Database/requests.js';
import { ServerSidePong } from "./Pong/ServerSidePong.js";
import { handleApiRequest } from "./Server/api.js";
import { allowCors } from "./Server/cors.js";
import { Client, handleWebsocket } from "./Server/webSocket.js";



import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const options: {https:ServerOptions} = {
    https: {
        key: fs.readFileSync(path.join("/tmp/ssl/transcendence.key")),
        cert: fs.readFileSync(path.join("/tmp/ssl/transcendence.crt")),
    },
};

export const app: FastifyInstance = fastify(options);

allowCors("https://localhost:3100", ["POST", "GET"], ["Content-Type", "X-Client-Id", "x-api-password"]);
handleApiRequest();

// ELK

registerHooks(app);

app.get("/", async (req, reply) => {
    logToELK({
        level: LogLevel.INFO,
        message: "Hello",
        service: "backend",
        type: LogType.REQUEST,
        timestamp: new Date().toISOString(),
    });
    return { hello: "world" };
});

// Fastify websocket
export const game: ServerSidePong = new ServerSidePong();
export const clients: Map<string, Client> = new Map();
export const registeredClients: Map<string, Client> = new Map();

handleWebsocket();

// Inscription

app.post("/inscription", async (request, reply) => {
    const { pseudo, mail, password } = request.body as { pseudo: string; mail: string; password: string };
    const id = request.headers["x-client-id"] as string;

    console.log(`new inscription request: ${pseudo} ${mail} ${password}`);

    if (!pseudo || !mail || !password) {
        return reply.status(400).send({ message: "Champs manquants" });
    }

    try {
        const isAvailable = await checkUserMAIL(mail);
        if (!isAvailable) {
            console.log("L'adresse e-mail existe déjà.");
            return reply.status(400).send({ message: "Email déjà utilisé" });
        }

        await createUser(mail, password, pseudo);
        return reply.status(200).send({ message: "Inscription réussie" });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        return reply.status(500).send({ message: "Erreur serveur" });
    }
});

// Connexion

function alreadyRegistered(mail: string): boolean {
	for (const [key, value] of registeredClients) {
        if (value.player.getMail() === mail) {
            console.log("ALREADY REGISTERED");
            return true;
        }
    }
	return false
}

app.post("/connexion", async (request, reply) => {
    const mail: string = (request.body as { mail: string }).mail;
    const password: string = (request.body as { password: string }).password;

	const id: string = request.headers["x-client-id"] as string;

	console.log(`new connexion request: ${mail}`)
    if (!mail || !password) {
        return reply.status(400).send({message: "Connexion failed"});
    }
	const client: Client | undefined = clients.get(id);
    const isValid: boolean = await new Promise<boolean>((resolve) => {
        checkUserID(mail, password, resolve);
    });
    if (isValid) {
		if (client)
		{
			if (alreadyRegistered(mail)) {
				console.log("ALREADY REGISTERED");
				client.socketStream.send(JSON.stringify({type: "error", error: "Already registered somewhere else."}));
				return reply.status(400).send({message: "Already registered somewhere else."});
			} 
            const pseudo: string | null = await getPseudo(mail);
            if (pseudo)
            {
                client.player.register(pseudo, mail);
                console.log(`Nouvel utilisateur enregistre: Id: ${id}, Name: ${pseudo}`);
                registeredClients.set(id, client);
                reply.status(200).send({message: `OK`});
                console.log('Login successfull.');
            }
        }
        else {
            console.log('ERROR.');
            return reply.status(500).send({message: "Internal Error"});
        }
    } else {
        console.log('Login failed.');
        return reply.status(400).send({message: "Login failed"});
    }
});

app.post("/info", async (request, reply) => {
    const mail: string = (request.body as { mail: string }).mail;
	const id: string = request.headers["x-client-id"] as string;
    const pseudoDB: string | null = await getPseudo(mail);
    const victoriesDB: number | null = await getVictories(mail);
    const avatarDB: string | null = await getAvatar(mail);
    const defeatsDB: number | null = await getDefeats(mail);

	console.log(`new information request: ${mail}`)
    if (!mail) {
        return reply.status(400).send({message: "Connexion failed"});
    }
    else {
        return reply.send({pseudo: pseudoDB, avatar: avatarDB, victories: victoriesDB, defeats: defeatsDB, mail: mail })
    }
});

app.post('/upload-avatar', async (request, reply) => {
    try {
        const clientId: string = request.headers['x-client-id'] as string;
        if (!clientId) {
            return reply.status(400).send({ error: 'Missing headers' });
        }
        const { mail }: { mail: string } = request.body as { mail: string };
        const { avatar }: { avatar: string } = request.body as { avatar: string };
        if (!avatar || !mail) {
            return reply.status(400).send({ error: 'Avatar or mail missing' });
        }

        if (!avatar.startsWith('data:image/png;base64,')) {
            return reply.status(400).send({ error: 'Invalid image format' });
        }

        const base64Data: string = avatar.replace(/^data:image\/png;base64,/, '');
        try {
            Buffer.from(base64Data, 'base64');
        } catch {
            return reply.status(400).send({ error: 'Invalid base64 data' });
        }

        const buffer: Buffer<ArrayBuffer> = Buffer.from(base64Data, 'base64');

        try {
            setAvatar(mail, avatar);
        } catch (error) {
            request.log.error('setAvatar failed:', error);
        }

        const fileName: string = `${Date.now()}-${mail}.png`;
        const filePath: string = join(__dirname, 'Avatars', fileName);
        await promises.writeFile(filePath, buffer);

        return reply.status(200).send({ message: 'OK', fileName });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Server error' });
    }
});
  
// server

const start = async () => {
    try {
        await app.listen({ port: 4500, host: "0.0.0.0" });
        console.log("🚀 Backend server running on https://localhost:4500");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
