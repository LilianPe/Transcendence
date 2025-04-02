import { logToELK } from "../logger/logToElk";
import { LogLevel, LogType } from "../logger/normalization";
import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { ServerSidePong } from "../serverSidePong";
import { mainGame } from "../pingpong/mains";

export function registerPingPongEndPoint(app: FastifyInstance)
{
    app.register(async function (fastify) {
        fastify.get("/ws", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
            console.log("Un client tente de se connecter...");

            socket.on("message", (message: Buffer | string) => {
                console.log("Message reçu du client: ", message.toString());
            });
    
            socket.on("error", (err: Buffer) => {
                console.error("Erreur WebSocket:", err);
            });
    
            mainGame(socket);

            socket.on("close", (code: number, reason: Buffer) => {
                console.log("Client déconnecté, code:", code, "raison:", reason.toString());
                clearInterval(interval);
            });
        });
    });
}