// Canvas Text Renderer Utility
// Provides functions to draw text directly on canvas, avoiding DOM text overlap

export class TextRenderer {
    /**
     * Draw centered text with shadow for visibility
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} fontSize - Font size (e.g., '48px Arial')
     * @param {string} fillColor - Fill color
     * @param {string} shadowColor - Shadow color for visibility
     * @param {number} shadowBlur - Shadow blur amount
     */
    static drawCenteredText(ctx, text, x, y, fontSize, fillColor, shadowColor = 'rgba(0,0,0,0.5)', shadowBlur = 4) {
        ctx.save();
        ctx.font = fontSize;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow for visibility
        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    /**
     * Draw right-aligned text with shadow
     */
    static drawRightText(ctx, text, x, y, fontSize, fillColor, shadowColor = 'rgba(0,0,0,0.5)', shadowBlur = 4) {
        ctx.save();
        ctx.font = fontSize;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    /**
     * Draw left-aligned text with shadow
     */
    static drawLeftText(ctx, text, x, y, fontSize, fillColor, shadowColor = 'rgba(0,0,0,0.5)', shadowBlur = 4) {
        ctx.save();
        ctx.font = fontSize;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    /**
     * Draw multi-line centered text (for game over screen)
     * Each line is an object: { text, fontSize, color }
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Array<{text: string, fontSize?: string, color?: string}>} lines 
     * @param {number} centerX - Center X position
     * @param {number} startY - Starting Y position (first line)
     * @param {number} lineSpacing - Extra spacing between lines
     */
    static drawCenteredMultiLine(ctx, lines, centerX, startY, lineSpacing = 8) {
        let currentY = startY;
        
        for (const line of lines) {
            const fontSize = line.fontSize || '18px Arial';
            const color = line.color || '#ffffff';
            
            ctx.save();
            ctx.font = fontSize;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = color;
            ctx.fillText(line.text, centerX, currentY);
            ctx.restore();
            
            // Measure line height for spacing
            const metrics = ctx.measureText(line.text);
            const lineHeight = parseInt(fontSize) + lineSpacing;
            currentY += lineHeight;
        }
    }
    
    /**
     * Draw the start screen text on canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     */
    static drawStartScreen(ctx, canvasWidth, canvasHeight) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Title - "FLAPPY BIRD"
        ctx.save();
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Title shadow/outline
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Title gradient
        const titleGradient = ctx.createLinearGradient(centerX - 100, centerY - 40, centerX + 100, centerY - 40);
        titleGradient.addColorStop(0, '#FFD700');
        titleGradient.addColorStop(0.5, '#FFA500');
        titleGradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = titleGradient;
        ctx.fillText('FLAPPY BIRD', centerX, centerY - 40);
        ctx.restore();
        
        // Subtitle - "Press SPACE or Click to Start"
        ctx.save();
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#ffffff';
        
        // Pulsing effect for subtitle
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 500);
        ctx.globalAlpha = pulse;
        ctx.fillText('Press SPACE or Click to Start', centerX, centerY + 20);
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    /**
     * Draw the game over screen text on canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     * @param {number} score 
     * @param {number} coinsCollected 
     * @param {number} bestScore 
     * @param {number} totalCoins 
     * @param {number} difficultyLevel 
     */
    static drawGameOverScreen(ctx, canvasWidth, canvasHeight, score, coinsCollected, bestScore, totalCoins, difficultyLevel) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Semi-transparent overlay background
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
        
        // Game Over title
        ctx.save();
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('Game Over!', centerX, centerY - 100);
        ctx.restore();
        
        // Stats lines
        const statsLines = [
            { text: `Score: ${score}`, fontSize: '20px Arial', color: '#ffffff' },
            { text: `Coins Collected: ${coinsCollected}`, fontSize: '18px Arial', color: '#FFD700' },
            { text: `Best Score: ${bestScore}`, fontSize: '18px Arial', color: '#2ecc71' },
            { text: `Total Coins: ${totalCoins}`, fontSize: '18px Arial', color: '#3498db' },
            { text: `Difficulty Reached: Level ${difficultyLevel}`, fontSize: '16px Arial', color: '#e67e22' }
        ];
        
        // Draw stats with proper spacing
        let statY = centerY - 50;
        for (const line of statsLines) {
            ctx.save();
            ctx.font = line.fontSize;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = line.color;
            ctx.fillText(line.text, centerX, statY);
            ctx.restore();
            statY += 30; // Line spacing
        }
        
        // Restart prompt with pulsing effect
        ctx.save();
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Press SPACE or Click to Restart', centerX, centerY + 130);
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    /**
     * Draw the score at top center of canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} score 
     */
    static drawScore(ctx, score) {
        const centerX = ctx.canvas.width / 2;
        const y = 55; // Position from top - adjusted to be fully visible within canvas
        
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        
        // White text with dark shadow for visibility
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(score.toString(), centerX, y);
        ctx.restore();
    }
    
    /**
     * Draw best score below the coin counter (left side, under coin HUD)
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} bestScore 
     */
    static drawBestScore(ctx, bestScore) {
        // Position: below the coin counter (coin counter is at y=10, height=35, so ends at y=45)
        // Place best score pill at y=55 with some spacing
        const x = 70; // Center of coin counter area (starts at x=10, width=120, center ~70)
        const y = 58; // Below coin counter (which ends at y=45)
        
        // Background pill
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const textWidth = ctx.measureText(`Best: ${bestScore}`).width + 20;
        const pillHeight = 28;
        this.fillRoundedRect(ctx, x - textWidth/2 - 10, y - pillHeight/2, textWidth + 20, pillHeight, 14);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        this.fillRoundedRect(ctx, x - textWidth/2 - 10, y - pillHeight/2, textWidth + 20, pillHeight, 14, true, false);
        ctx.restore();
        
        // Text
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Best: ${bestScore}`, x, y);
        ctx.restore();
    }
    
    /**
     * Helper to fill and/or stroke a rounded rectangle
     */
    static fillRoundedRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }
}