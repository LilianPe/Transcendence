import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import { promises as fs } from 'fs';
import { join } from 'path';
import { checkUserID, checkUserMAIL, createUser, getAvatar, getDefeats, getPseudo, getVictories, setAvatar } from './Database/requests.js';
import { ServerSidePong } from "./Pong/ServerSidePong.js";
import { handleApiRequest } from "./Server/api.js";
import { allowCors } from "./Server/cors.js";
import { Client, handleWebsocket } from "./Server/webSocket.js";

// -------Pour le https-------------
//
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const options = {
//     https: {
//         key: fs.readFileSync(path.join(__dirname, "../certs/localhost+2-key.pem")),
//         cert: fs.readFileSync(path.join(__dirname, "../certs/localhost+2.pem")),
//     },
// };
//
// ----------------------------------

export const app: FastifyInstance = fastify(/*options*/);

allowCors("http://localhost:3000", ["POST", "GET"], ["Content-Type", "X-Client-Id"]);
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

// Registrations

// app.post("/register", async (request, reply) => {
//     const username: string = (request.body as { username: string }).username;
// 	const id: string = request.headers["x-client-id"] as string;

// 	console.log(`new registration request: ${username}`)
//     if (!username) {
//         return reply.status(400).send({message: "Username can't be blank"});
//     }
// 	const client: Client | undefined = clients.get(id);
// 	if (client) {
// 		client.player.register(username);
// 		console.log(`Nouvel utilisateur enregistre: Id: ${id}, Name: ${username}`);
// 		registeredClients.set(id, client);
// 		reply.send({message: `Inscription reussie pour ${username}`})
// 	}
// 	else {
// 		reply.status(500).send({message: "Internal Error"});
// 	}
// });


// Inscription

app.post("/inscription", async (request, reply) => {
    const pseudo: string = (request.body as { pseudo: string }).pseudo;
    const mail: string = (request.body as { mail: string }).mail;
    const password: string = (request.body as { password: string }).password;

	const id: string = request.headers["x-client-id"] as string;

	console.log(`new inscription request: ${pseudo} ${mail} ${password}`)
    if (!pseudo || !mail || !password) {
        return reply.status(400).send({message: "Incription failed"});
    }
	const client: Client | undefined = clients.get(id);
    checkUserMAIL(mail, (isValid) => {
        if (isValid) {
            console.log('L\'adresse e-mail est disponible.');
            createUser(mail, password, pseudo);
        } else {
            console.log('L\'adresse e-mail existe déjà.');
            return reply.status(400).send({message: "Incription failed"});
        }
    });
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

	console.log(`new connexion request: ${mail} ${password}`)
    if (!mail || !password) {
        return reply.status(400).send({message: "Connexion failed"});
    }
	const client: Client | undefined = clients.get(id);
    const isValid = await new Promise<boolean>((resolve) => {
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
            const pseudo = await getPseudo(mail);
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
    const pseudoDB = await getPseudo(mail);
    const victoriesDB = await getVictories(mail);
    const avatarDB = await getAvatar(mail);
    const defeatsDB = await getDefeats(mail);

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
        const clientId = request.headers['x-client-id'] as string;
        if (!clientId) {
            return reply.status(400).send({ error: 'Missing headers' });
        }
        const { mail } = request.body as { mail: string };
        const { avatar } = request.body as { avatar: string };
        if (!avatar || !mail) {
            return reply.status(400).send({ error: 'Avatar or mail missing' });
        }

        if (!avatar.startsWith('data:image/png;base64,')) {
            return reply.status(400).send({ error: 'Invalid image format' });
        }

        const base64Data = avatar.replace(/^data:image\/png;base64,/, '');
        try {
            Buffer.from(base64Data, 'base64');
        } catch {
            return reply.status(400).send({ error: 'Invalid base64 data' });
        }

        const buffer = Buffer.from(base64Data, 'base64');

        try {
            setAvatar(mail, avatar);
        } catch (error) {
            request.log.error('setAvatar failed:', error);
        }

        const fileName = `${Date.now()}-${mail}.png`;
        const filePath = join(__dirname, 'Avatars', fileName);
        await fs.writeFile(filePath, buffer);

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
        console.log("🚀 Backend server running on http://localhost:4500");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
