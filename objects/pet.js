// Pet Companion - dynamically flies around the bird
import { PET_CONFIG } from '../config/constants.js';

export class Pet {
    constructor() {
        this.width = PET_CONFIG.width;
        this.height = PET_CONFIG.height;
        // Pet's own position (relative to bird, not absolute)
        this.relX = PET_CONFIG.defaultOffsetX;
        this.relY = PET_CONFIG.defaultOffsetY;
        // Velocity for smooth movement
        this.velX = 0;
        this.velY = 0;
        // Animation phases
        this.wingPhase = 0;
        this.behaviorTimer = Math.random() * 1000;
        // Target offset for current behavior
        this.targetRelX = this.relX;
        this.targetRelY = this.relY;
        // Current behavior state
        this.currentBehavior = 'orbit'; // orbit, follow, circle, wander
        this.behaviorDuration = 0;
        // Memory of bird position for context
        this.lastBirdVelY = 0;
    }

    reset() {
        this.relX = PET_CONFIG.defaultOffsetX;
        this.relY = PET_CONFIG.defaultOffsetY;
        this.velX = 0;
        this.velY = 0;
        this.wingPhase = 0;
        this.behaviorTimer = 0;
        this.targetRelX = this.relX;
        this.targetRelY = this.relY;
        this.currentBehavior = 'orbit';
        this.behaviorDuration = 0;
        this.lastBirdVelY = 0;
    }

    update(bird) {
        this.lastBirdVelY = bird.velocity;
        this.behaviorTimer += 1;
        this.wingPhase += 0.3;

        // Change behavior periodically or based on bird state
        if (this.behaviorDuration > 0) {
            this.behaviorDuration--;
        } else {
            this.selectNewBehavior();
        }

        // Apply forces toward target position
        const dx = this.targetRelX - this.relX;
        const dy = this.targetRelY - this.relY;
        
        // Spring force toward target
        this.velX += dx * 0.008;
        this.velY += dy * 0.008;
        
        // Damping for stability
        this.velX *= 0.92;
        this.velY *= 0.92;
        
        // Add organic wandering (sine waves at different frequencies)
        const time = performance.now() / 1000;
        this.velX += Math.sin(time * 1.3 + this.relY * 0.01) * 0.15;
        this.velY += Math.cos(time * 1.1 + this.relX * 0.01) * 0.1;
        
        // Add small reaction to bird's movement (pet reacts to bird's actions)
        if (Math.abs(bird.velocity) > 2) {
            // When bird is falling fast, pet flies up slightly
            if (bird.velocity > 0) {
                this.velY -= 0.3;
            }
            // When bird is jumping, pet gives a little boost
            if (bird.velocity < -2) {
                this.velY += 0.2;
            }
        }
        
        // Update relative position
        this.relX += this.velX;
        this.relY += this.velY;
        
        // Keep pet in a reasonable range around the bird
        const distFromBird = Math.sqrt(this.relX * this.relX + this.relY * this.relY);
        const maxDist = PET_CONFIG.maxDistance;
        if (distFromBird > maxDist) {
            const scale = maxDist / distFromBird;
            this.relX *= scale;
            this.relY *= scale;
            this.velX *= 0.5;
            this.velY *= 0.5;
        }
        
        // Minimum distance - don't get too close to bird
        const minDist = PET_CONFIG.minDistance;
        if (distFromBird < minDist && distFromBird > 0) {
            const scale = minDist / distFromBird;
            this.relX *= scale;
            this.relY *= scale;
        }
    }

    selectNewBehavior() {
        const behaviors = ['orbit', 'follow', 'circle', 'wander'];
        const newBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        
        if (newBehavior === 'orbit') {
            this.currentBehavior = 'orbit';
            this.behaviorDuration = 120 + Math.random() * 180;
            this.targetRelX = -PET_CONFIG.orbitRadius;
            this.targetRelY = Math.sin(performance.now() / 1000 * 2) * 10;
        } else if (newBehavior === 'follow') {
            this.currentBehavior = 'follow';
            this.behaviorDuration = 60 + Math.random() * 120;
            this.targetRelX = PET_CONFIG.defaultOffsetX;
            this.targetRelY = PET_CONFIG.defaultOffsetY;
        } else if (newBehavior === 'circle') {
            this.currentBehavior = 'circle';
            this.behaviorDuration = 180 + Math.random() * 120;
            this.targetRelX = Math.cos(performance.now() / 800) * PET_CONFIG.orbitRadius;
            this.targetRelY = Math.sin(performance.now() / 800) * PET_CONFIG.orbitRadius * 0.6;
        } else {
            this.currentBehavior = 'wander';
            this.behaviorDuration = 90 + Math.random() * 150;
            // Random position within allowed range
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * PET_CONFIG.maxDistance * 0.5;
            this.targetRelX = Math.cos(angle) * dist;
            this.targetRelY = Math.sin(angle) * dist;
        }
    }

    draw(ctx, birdX, birdY) {
        // Calculate absolute position from relative offset
        const x = birdX + this.relX;
        const y = birdY + this.relY;
        
        // Calculate tilt based on horizontal velocity for dynamic feel
        const tilt = this.velX * 0.05;
        
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(tilt);
        
        // Draw a cute companion creature (small bird-like pet)
        const scale = 0.5; // Make it smaller than the main bird
        ctx.scale(scale, scale);
        
        // Body (different color - blue)
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
        
        // Eye (large, cute)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(6, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Small beak
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(10, 2);
        ctx.lineTo(18, 4);
        ctx.lineTo(10, 6);
        ctx.closePath();
        ctx.fill();
        
        // Wings (animated)
        const wingFlap = Math.sin(this.wingPhase) * 0.3;
        ctx.save();
        ctx.translate(-3, 2);
        ctx.rotate(wingFlap);
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.ellipse(-3, 0, 7, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1f6da3';
        ctx.lineWidth = 1 / scale;
        ctx.stroke();
        ctx.restore();
        
        // Small tail
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-18, -4);
        ctx.lineTo(-18, 4);
        ctx.closePath();
        ctx.fill();
        
        // Cute blush marks
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-4, 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Draw pet flying away (used during game over)
    drawFlyingAway(ctx) {
        const time = performance.now() / 1000;
        
        // Fly up and to the right, away from the bird
        const flyX = Math.cos(time * 0.5) * 100;
        const flyY = -Math.abs(Math.sin(time * 0.7)) * 150 - 50;
        
        // Calculate tilt based on flight direction
        const tilt = Math.sin(time * 0.5) * 0.3 - 0.5;
        
        ctx.save();
        ctx.translate(flyX + this.width / 2, flyY + this.height / 2);
        ctx.rotate(tilt);
        
        // Draw a cute companion creature (small bird-like pet)
        const scale = 0.5;
        ctx.scale(scale, scale);
        
        // Body (different color - blue)
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
        
        // Eye (large, cute)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(6, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Small beak
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(10, 2);
        ctx.lineTo(18, 4);
        ctx.lineTo(10, 6);
        ctx.closePath();
        ctx.fill();
        
        // Wings (animated faster for flying)
        const wingFlap = Math.sin(this.wingPhase * 2) * 0.4;
        ctx.save();
        ctx.translate(-3, 2);
        ctx.rotate(wingFlap);
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.ellipse(-3, 0, 7, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1f6da3';
        ctx.lineWidth = 1 / scale;
        ctx.stroke();
        ctx.restore();
        
        // Small tail
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-18, -4);
        ctx.lineTo(-18, 4);
        ctx.closePath();
        ctx.fill();
        
        // Cute blush marks
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-4, 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
