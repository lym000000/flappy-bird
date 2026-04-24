// Ground Rendering
import { GROUND_HEIGHT, BASE_PIPE_SPEED as PIPE_SPEED } from '../config/constants.js';

// ============================================================
// GROUND CLASS
// ============================================================
export class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = 0;
    }

    reset() {
        this.offset = 0;
    }

    update(groundSpeed) {
        this.offset = (this.offset + groundSpeed) % 24;
    }

    draw(ctx, seasonManager) {
        if (seasonManager) {
            // Get day-night state for ground colors
            const dayNight = seasonManager.getDayNightState();

            // Combine season colors with day-night lighting
            // Use day-night interpolated ground colors
            this.drawGroundBase(ctx, dayNight.groundBase);
            this.drawGroundTop(ctx, dayNight.groundTop, dayNight.groundBase);
            this.drawGroundPattern(ctx, dayNight.groundPattern);
        } else {
            this.drawGroundBase(ctx);
            this.drawGroundTop(ctx);
            this.drawGroundPattern(ctx);
        }
    }

    drawGroundBase(ctx, color) {
        ctx.fillStyle = color !== undefined ? color : '#d35400';
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, GROUND_HEIGHT);
    }

    drawGroundTop(ctx, topColor, baseColor) {
        const tc = topColor !== undefined ? topColor : '#f39c12';
        const bc = baseColor !== undefined ? baseColor : '#d35400';
        const groundGradient = ctx.createLinearGradient(0, this.canvas.height - GROUND_HEIGHT, 0, this.canvas.height - GROUND_HEIGHT + 20);
        groundGradient.addColorStop(0, tc);
        groundGradient.addColorStop(1, bc);
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, 20);
    }

    drawGroundPattern(ctx, color) {
        const c = color !== undefined ? color : '#e67e22';
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        for (let x = -this.offset; x < this.canvas.width; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, this.canvas.height - GROUND_HEIGHT + 20);
            ctx.lineTo(x + 12, this.canvas.height);
            ctx.stroke();
        }
    }
}