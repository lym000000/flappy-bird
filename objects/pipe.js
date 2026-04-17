// Pipe Manager with Difficulty Scaling
import { 
    BASE_PIPE_SPEED, MAX_PIPE_SPEED, PIPE_SPEED_INCREMENT,
    BASE_PIPE_GAP, MIN_PIPE_GAP, GAP_REDUCTION_PER_LEVEL,
    BASE_SPAWN_INTERVAL, MIN_SPAWN_INTERVAL, SPAWN_INTERVAL_REDUCTION_PER_LEVEL,
    PIPE_WIDTH, PIPE_HEIGHT_VARIANCE
} from '../config/constants.js';

export class PipeManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.pipes = [];
        this.coins = [];
        this.difficultyLevel = 1; // Start at level 1
        this.onCoinCollect = null; // Callback for coin collection
        this.totalCoinsCollected = 0; // Track total coins across game sessions
    }

    reset() {
        this.pipes = [];
        this.coins = [];
        this.difficultyLevel = 1; // Reset to level 1
        // Note: onCoinCollect is intentionally preserved (set once via setOnCoinCollect)
        this.totalCoinsCollected = 0;
    }

    setOnCoinCollect(callback) {
        this.onCoinCollect = callback;
    }

    /**
     * Calculate current difficulty level based on score
     * Level starts at 1 and increments every 5 scores
     * Score 0-4 = Level 1, Score 5-9 = Level 2, etc.
     */
    getDifficultyLevel(score) {
        return Math.floor(score / 5) + 1;
    }

    /**
     * Get current pipe speed based on difficulty level
     * Level 1 uses base values (no modification)
     */
    getCurrentPipeSpeed() {
        const effectiveLevel = this.difficultyLevel - 1; // Level 1 = base, no modification
        const speed = BASE_PIPE_SPEED + (effectiveLevel * PIPE_SPEED_INCREMENT);
        return Math.min(speed, MAX_PIPE_SPEED);
    }

    /**
     * Get current pipe gap based on difficulty level
     * Level 1 uses base values (no modification)
     */
    getCurrentPipeGap() {
        const effectiveLevel = this.difficultyLevel - 1; // Level 1 = base, no modification
        const gap = BASE_PIPE_GAP - (effectiveLevel * GAP_REDUCTION_PER_LEVEL);
        return Math.max(gap, MIN_PIPE_GAP);
    }

    /**
     * Get current spawn interval based on difficulty level
     * Level 1 uses base values (no modification)
     */
    getCurrentSpawnInterval() {
        const effectiveLevel = this.difficultyLevel - 1; // Level 1 = base, no modification
        const interval = BASE_SPAWN_INTERVAL - (effectiveLevel * SPAWN_INTERVAL_REDUCTION_PER_LEVEL);
        return Math.max(interval, MIN_SPAWN_INTERVAL);
    }

    /**
     * Get difficulty info object for UI display
     */
    getDifficultyInfo() {
        return {
            level: this.difficultyLevel,
            pipeSpeed: this.getCurrentPipeSpeed(),
            gap: this.getCurrentPipeGap(),
            spawnInterval: this.getCurrentSpawnInterval()
        };
    }

    create(minHeight, maxHeight) {
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        const pipeX = this.canvas.width;
        const bottomY = topHeight + this.getCurrentPipeGap();

        this.pipes.push({
            x: pipeX,
            topHeight: topHeight,
            bottomY: bottomY,
            scored: false
        });

        // Create coins in the gap between pipes
        if (this.onCoinCollect) {
            this.createCoins(pipeX, topHeight, bottomY);
        }
    }

    createCoins(pipeX, topHeight, bottomY) {
        const centerX = pipeX + PIPE_WIDTH / 2;
        const availableHeight = bottomY - topHeight;
        const coinSpacing = 35;
        const coinsPerSet = Math.min(3, Math.floor(availableHeight / coinSpacing));
        const totalCoinHeight = (coinsPerSet - 1) * coinSpacing;
        const startY = topHeight + (availableHeight - totalCoinHeight) / 2;

        for (let i = 0; i < coinsPerSet; i++) {
            const y = startY + i * coinSpacing;
            this.coins.push({
                x: centerX - 12,
                y: y,
                width: 24,
                height: 24,
                radius: 12,
                collected: false,
                bobOffset: Math.random() * Math.PI * 2,
                sparkleTime: Math.random() * 100
            });
        }
    }

    update(bird, onScore, onCollision, onCoinCollect) {
        const speed = this.getCurrentPipeSpeed();
        let collisionOccurred = false;
        
        // Update coins first
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];

            if (coin.collected) {
                this.coins.splice(i, 1);
                continue;
            }

            // Move coin
            coin.x -= speed;

            // Check collision with bird
            if (!coin.collected && this.checkCoinCollision(bird, coin)) {
                coin.collected = true;
                if (onCoinCollect) {
                    onCoinCollect();
                }
                this.totalCoinsCollected++;
            }

            // Remove off-screen or collected coins
            if (coin.x + coin.width < 0 || coin.collected) {
                if (coin.collected && onCoinCollect) {
                    // Already handled above, just remove next frame
                }
                this.coins.splice(i, 1);
            }
        }
        
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= speed;

            // Remove off-screen pipes
            if (pipe.x + PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            // Score when bird passes pipe
            if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
                pipe.scored = true;
                onScore();
            }

            // Collision detection - only check against this pipe
            if (!collisionOccurred && this.checkCollision(bird, pipe)) {
                collisionOccurred = true;
            }
        }
        
        // Call onCollision once after checking all pipes
        if (collisionOccurred) {
            onCollision();
        }
    }

    checkCoinCollision(bird, coin) {
        const bobAmount = 3;
        const bobbedY = coin.y + Math.sin(Date.now() / 300 + coin.bobOffset) * bobAmount;
        
        const coinCenterX = coin.x + coin.radius;
        const coinCenterY = bobbedY + coin.radius;

        // Circle-rectangle collision
        const closestX = Math.max(bird.x, Math.min(coinCenterX, bird.x + bird.width));
        const closestY = Math.max(bird.y, Math.min(coinCenterY, bird.y + bird.height));

        const distanceX = coinCenterX - closestX;
        const distanceY = coinCenterY - closestY;

        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < (coin.radius * coin.radius);
    }

    checkCollision(bird, pipe) {
        // Use slightly smaller hitbox for fairness (padding around bird edges)
        const padding = 4;
        const birdLeft = bird.x + padding;
        const birdRight = bird.x + bird.width - padding;
        const birdTop = bird.y + padding;
        const birdBottom = bird.y + bird.height - padding;

        // Check horizontal overlap with pipe
        if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
            // Check vertical overlap with top pipe OR bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        // Draw coins first (behind pipes)
        this.drawCoins(ctx);
        // Draw pipes
        this.pipes.forEach(pipe => {
            this.drawPipe(ctx, pipe);
        });
    }

    drawCoins(ctx) {
        const currentTime = Date.now();
        this.coins.forEach(coin => {
            if (coin.collected) return;

            const bobAmount = 3;
            const bobbedY = coin.y + Math.sin(currentTime / 300 + coin.bobOffset) * bobAmount;
            const centerX = coin.x + coin.radius;
            const centerY = bobbedY + coin.radius;

            // Draw sparkle effects
            for (let i = 0; i < 4; i++) {
                const angle = (currentTime / 200 + (i * Math.PI / 2)) % (Math.PI * 2);
                const dist = 16 + Math.sin(currentTime / 300 + i) * 3;
                const sx = centerX + Math.cos(angle) * dist;
                const sy = centerY + Math.sin(angle) * dist;
                const alpha = 0.3 + Math.sin(currentTime / 150 + i) * 0.2;

                ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Outer glow
            ctx.save();
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;

            // Coin body - gold circle
            const gradient = ctx.createRadialGradient(
                centerX - 3, centerY - 3, 2,
                centerX, centerY, coin.radius
            );
            gradient.addColorStop(0, '#FFF8DC');
            gradient.addColorStop(0.3, '#FFD700');
            gradient.addColorStop(1, '#DAA520');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coin.radius, 0, Math.PI * 2);
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
        });
    }

    get coins() {
        return this._coins;
    }

    set coins(value) {
        this._coins = value;
    }

    drawPipe(ctx, pipe) {
        // Top pipe
        const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        topGradient.addColorStop(0, '#27ae60');
        topGradient.addColorStop(0.5, '#2ecc71');
        topGradient.addColorStop(1, '#27ae60');
        ctx.fillStyle = topGradient;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Top pipe cap
        ctx.fillStyle = '#229954';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 25, PIPE_WIDTH + 6, 25);
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x - 3, pipe.topHeight - 25, PIPE_WIDTH + 6, 25);

        // Bottom pipe
        const bottomGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        bottomGradient.addColorStop(0, '#27ae60');
        bottomGradient.addColorStop(0.5, '#2ecc71');
        bottomGradient.addColorStop(1, '#27ae60');
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, this.canvas.height - pipe.bottomY);

        // Bottom pipe cap
        ctx.fillStyle = '#229954';
        ctx.fillRect(pipe.x - 3, pipe.bottomY, PIPE_WIDTH + 6, 25);
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x - 3, pipe.bottomY, PIPE_WIDTH + 6, 25);
    }

    get pipes() {
        return this._pipes;
    }

    set pipes(value) {
        this._pipes = value;
    }
}