"use strict";
// A mettre apres dans le frontend
const ws = new WebSocket("ws://localhost:4501/ws");
let canvas = document.querySelector("canvas");
console.log(canvas);
canvas.width = 800;
canvas.height = 800;
let canvasContext = canvas.getContext("2d");
let oldx;
let oldy;
ws.onmessage = (event) => {
    const state = JSON.parse(event.data);
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, 800, 800);
    oldx = state.ballX;
    oldy = state.ballY;
    console.log("x: ", oldx, "y: ", oldy);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(state.ballX, state.ballY, 10, 10);
};
ws.onopen = () => console.log("Connected to WebSocket server");
ws.onerror = (error) => console.error("WebSocket error:", error);
ws.onclose = (event) => {
    console.log("WebSocket connection closed. Code:", event.code, "Reason:", event.reason);
};
