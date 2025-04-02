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
                logToELK({
                    level: LogLevel.INFO,
                    message: message.toString(),
                    service: "backend",
                    type: LogType.WEBSOCKET,
                    timestamp: new Date().toISOString(),
                });
            });
    
            socket.on("error", (err: Buffer) => {
                logToELK({
                    level: LogLevel.ERROR,
                    message: err.toString(),
                    service: "backend",
                    type: LogType.WEBSOCKET,
                    timestamp: new Date().toISOString(),
                });
            });
    
            mainGame(socket);

            socket.on("close", (code: number, reason: Buffer) => {
                logToELK({
                    level: LogLevel.INFO,
                    message: reason.toString(),
                    service: "backend",
                    type: LogType.WEBSOCKET,
                    timestamp: new Date().toISOString(),
                });
                clearInterval(interval);
            });
        });
    });
}