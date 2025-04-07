export function drawLeftPlayer(y: number, canvasContext: CanvasRenderingContext2D): void {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(20, y, 10, 100);
}

export function drawRightPlayer(y: number, canvasContext: CanvasRenderingContext2D): void {
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(770, y, 10, 100);
}

export function displayScore(s1: number, s2: number, canvasContext: CanvasRenderingContext2D) {
    canvasContext.font = "100px Arial";
    canvasContext.strokeStyle = "white";
    canvasContext.strokeText("" + s1, 175, 400);
    canvasContext.strokeText("" + s2, 575, 400);
}

export function displayLine(canvasContext: CanvasRenderingContext2D): void {
    canvasContext.fillStyle = "grey";
    canvasContext.fillRect(398, 0, 4, 800);
}