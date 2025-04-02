import fastify, { FastifyInstance } from "fastify";
import { LogLevel, LogType } from "././logger/normalization.js";
import { registerHooks } from "./logger/hook.js";
import { logToELK } from "./logger/logToElk.js";
// @ts-ignore
import fastifyWebsocket from "@fastify/websocket";
import { Player, ServerSidePong } from "./serverSidePong.js";

const app: FastifyInstance = fastify();

// @fastify/websocket

app.register(fastifyWebsocket);

app.get("/ws", { websocket: true }, (socket, request) => {
  socket.on("message", async (message) => {
    console.log("Message received!");
  });
});

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

const start = async () => {
  try {
    await app.listen({ port: 4500, host: "0.0.0.0" });
    console.log("🚀 Backend server running on http://localhost:4500");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const game = new ServerSidePong();

interface GameState {
  ballX: number;
  ballY: number;
}
// const wss = new WebSocketServer({ port: 4501 });

// wss.on("connection", (ws: WebSocket) => {
//   console.log("Client connected.");
//   const interval = setInterval(() => {
//     if (ws.readyState === ws.OPEN) {
//       const state = {
//         ballX: game.getGame().getBall().getX(),
//         ballY: game.getGame().getBall().getY(),
//       };
//       ws.send(JSON.stringify(state));
//     }
//   }, 1000 / 60);
//   ws.on("close", (code: number, reason: Buffer) => {
//     console.log(
//       "Client disconnected, code:",
//       code,
//       "reason:",
//       reason.toString()
//     );
//     clearInterval(interval);
//   });
// });

function startGame(): void {
  game.launchGame(new Player("Player1"), new Player("Player2"));
  console.log("Game is runing!");
}

startGame();

start();
