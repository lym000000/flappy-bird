// Coin Object - Collectible coins placed between pipes
import { BIRD_CONFIG } from '../config/constants.js';

export class Coin {
    constructor(x, y, canvasHeight) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.radius = 12;
        this.collected = false;
        this.canvasHeight = canvasHeight;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.sparkles = [];
    }

    update(speed) {
        this.x -= speed;
    }

    // Get the bobbing Y position for animation
    getBobbedY() {
        const bobAmount = 3;
        return this.y + Math.sin(Date.now() / 300 + this.bobOffset) * bobAmount;
    }

    draw(ctx) {
        if (this.collected) return;

        const drawY = this.getBobbedY();
        const centerX = this.x + this.radius;
        const centerY = drawY + this.radius;

        // Draw sparkle effects if coin is near bird height
        this.drawSparkles(ctx, centerX, centerY);

        // Outer glow
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;

        // Coin body - gold circle
        const gradient = ctx.createRadialGradient(
            centerX - 3, centerY - 3, 2,
            centerX, centerY, this.radius
        );
        gradient.addColorStop(0, '#FFF8DC');   // Light gold highlight
        gradient.addColorStop(0.3, '#FFD700');  // Gold
        gradient.addColorStop(1, '#DAA520');    // Dark gold

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Coin border
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Dollar sign ($) on coin
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', centerX, centerY + 0.5);

        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSparkles(ctx, centerX, centerY) {
        const time = Date.now() / 200;
        for (let i = 0; i < 4; i++) {
            const angle = (time + (i * Math.PI / 2)) % (Math.PI * 2);
            const dist = 16 + Math.sin(time + i) * 3;
            const sx = centerX + Math.cos(angle) * dist;
            const sy = centerY + Math.sin(angle) * dist;
            const alpha = 0.3 + Math.sin(time * 2 + i) * 0.2;

            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    checkCollision(bird) {
        if (this.collected) return false;

        const bobbedY = this.getBobbedY();
        const coinCenterX = this.x + this.radius;
        const coinCenterY = bobbedY + this.radius;

        // Simple circle-rectangle collision for fairness
        const closestX = Math.max(bird.x, Math.min(coinCenterX, bird.x + bird.width));
        const closestY = Math.max(bird.y, Math.min(coinCenterY, bird.y + bird.height));

        const distanceX = coinCenterX - closestX;
        const distanceY = coinCenterY - closestY;

        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < (this.radius * this.radius);
    }

    markCollected() {
        this.collected = true;
    }

    isOffScreen() {
        return this.x + this.width < 0 || this.collected;
    }
}

// Coin Manager - handles coin placement and management
export class CoinManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.coins = [];
        this.coinsPerPipeSet = 3; // Number of coins per pipe pair
        this.coinSpacing = 50; // Spacing between coins in a set
    }

    reset() {
        this.coins = [];
    }

    /**
     * Create a set of coins at a given position
     * Coins are placed vertically between the top and bottom pipes
     */
    createCoinSet(pipeX, topHeight, bottomY) {
        const centerX = pipeX + 30; // Center of pipe
        const availableHeight = bottomY - topHeight;
        const coinStartY = topHeight + (availableHeight / 2) - ((this.coinsPerPipeSet - 1) * this.coinSpacing / 2);

        for (let i = 0; i < this.coinsPerPipeSet; i++) {
            const y = coinStartY + i * this.coinSpacing;
            const coin = new Coin(centerX - this.radius, y, this.canvas.height);
            this.coins.push(coin);
        }
    }

    update(speed, bird, onCoinCollect) {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];

            if (coin.collected) {
                // Remove collected coins after a brief moment
                this.coins.splice(i, 1);
                continue;
            }

            coin.update(speed);

            // Check collision with bird
            if (coin.checkCollision(bird)) {
                coin.markCollected();
                onCoinCollect();
            }

            // Remove off-screen coins
            if (coin.isOffScreen()) {
                this.coins.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.coins.forEach(coin => {
            coin.draw(ctx);
        });
    }

    getCoinCount() {
        return this.coins.filter(c => !c.collected).length;
    }
}