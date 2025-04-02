import { ServerSidePong } from "../serverSidePong";

export function mainGame(socket: WebSocket)
{
    console.log("connection");
    const game = new ServerSidePong();
    const interval = setInterval(() => {
        const state = {
            ballX: game.getGame().getBall().getX(),
            ballY: game.getGame().getBall().getY(),
        };
        socket.send(JSON.stringify(state));
    }, 1000 / 60);
}