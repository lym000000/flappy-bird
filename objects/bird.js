// Bird Object
import { GRAVITY, JUMP_FORCE, BIRD_CONFIG, BOBBING_CONFIG, GROUND_HEIGHT } from '../config/constants.js';
import { createFeatherTrail, getParticleManager } from './particles.js';

export class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = BIRD_CONFIG.startX;
        this.y = BIRD_CONFIG.startY;
        this.width = BIRD_CONFIG.width;
        this.height = BIRD_CONFIG.height;
        this.velocity = 0;
        this.rotation = 0;
    }

    reset() {
        this.x = BIRD_CONFIG.startX;
        this.y = BIRD_CONFIG.startY;
        this.velocity = 0;
        this.rotation = 0;
    }

    jump() {
        this.velocity = JUMP_FORCE;
        // Emit feather trail particles when flapping
        const pm = getParticleManager();
        if (pm) {
            const feathers = createFeatherTrail(this.x + this.width / 2, this.y + this.height / 2);
            pm.addParticles(feathers);
        }
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Rotation based on velocity
        this.rotation = Math.min(Math.max(this.velocity * 3, -30), 90);

        // Ground collision
        if (this.y + this.height > this.canvas.height - GROUND_HEIGHT) {
            this.y = this.canvas.height - GROUND_HEIGHT - this.height;
            return true; // Hit ground
        }

        // Ceiling collision
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);

        // Body
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(8, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(10, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, 3);
        ctx.lineTo(12, 6);
        ctx.closePath();
        ctx.fill();

        // Wing
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.ellipse(-5, 3, 10, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d68910';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    // Bobbing animation for start screen
    drawBobbing(ctx, timestamp) {
        this.y = BOBBING_CONFIG.baseY + Math.sin(timestamp / BOBBING_CONFIG.frequency) * BOBBING_CONFIG.amplitude;
        this.draw(ctx);
    }
}