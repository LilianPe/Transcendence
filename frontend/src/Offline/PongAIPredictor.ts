import { BallObserver } from "../Pong/BallObserver.js";
import { Pong } from "../Pong/Pong.js";
import { AIMove } from "./pongAiExecutor.js";

export class PongAIPredictor implements BallObserver {
	private pong: Pong;

	constructor(pong: Pong) {
		this.pong = pong;
		this.pong.getGame().getBall().subscribe(this);
	}

    public notify(): void {
        const targetY = this.predictLandingY();
        AIMove(targetY);
    }

    private predictLandingY(): number {
        const ball = this.pong.getGame().getBall();
    
        const x0 = ball.getX();
        const y0 = ball.getY();
        const angle = ball.getAngle(); // radians
    
        const tableHeight = 800;
        const targetX = 770;
    
        const dx = targetX - x0;
        let y = y0 + Math.tan(angle) * dx;
    
        if (y > tableHeight) {
            y = 2 * tableHeight - y;
        } else if (y < 0) {
            y = -y;
        }
    
        return y;
    }

}
