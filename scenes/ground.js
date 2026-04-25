// Ground Rendering
import { GROUND_HEIGHT, BASE_PIPE_SPEED as PIPE_SPEED } from '../config/constants.js';

// ============================================================
// Ground DECORATION TYPES
// ============================================================
const GROUND_DECORATIONS = {
    NONE: 'none',
    AUTUMN_LEAVES: 'autumn_leaves',
    WINTER_SNOW: 'winter_snow',
    SPRING_FLOWERS: 'spring_flowers',
    SUMMER_CRACKS: 'summer_cracks',
    RAIN_WET: 'rain_wet',
    SNOW_COVER: 'snow_cover'
};

// ============================================================
// Ground CLASS - Weather/Season Responsive Ground
// ============================================================
export class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = 0;
        
        // Ground decoration state
        this.currentDecoration = GROUND_DECORATIONS.NONE;
        this.targetDecoration = GROUND_DECORATIONS.NONE;
        this.decorationTransition = 0;
        
        // Pre-generate random decorations for each frame
        this._groundLeaves = [];
        this._groundFlowers = [];
        this._groundCracks = [];
        this._snowPatches = [];
        this._wetReflections = [];
        
        this._initDecorations();
    }

    _initDecorations() {
        // Generate autumn leaves scattered on ground - more vibrant and varied
        for (let i = 0; i < 45; i++) {
            this._groundLeaves.push({
                x: Math.random() * 800,
                y: Math.random() * 18,
                size: 3 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                color: ['#D2691E', '#B8860B', '#CD853F', '#A0522D', '#8B4513', '#FF6347', '#FF4500', '#DAA520', '#BC8F1F'][Math.floor(Math.random() * 9)],
                type: Math.floor(Math.random() * 4),
                opacity: 0.5 + Math.random() * 0.4
            });
        }

        // Generate spring flowers - more vibrant and diverse
        for (let i = 0; i < 35; i++) {
            this._groundFlowers.push({
                x: Math.random() * 800,
                y: Math.random() * 14,
                size: 4 + Math.random() * 7,
                color: ['#FF69B4', '#FF1493', '#FF6EB4', '#DA70D6', '#BA55D3', '#9370DB', '#FFD700', '#FFA500', '#FF4444', '#FFFFFF'][Math.floor(Math.random() * 10)],
                petalCount: 5 + Math.floor(Math.random() * 4),
                hasCenter: Math.random() > 0.3,
                stemHeight: 8 + Math.random() * 12
            });
        }

        // Generate summer ground cracks - more natural patterns
        for (let i = 0; i < 25; i++) {
            this._groundCracks.push(this._generateCrack());
        }

        // Generate snow patch positions for winter ground
        for (let i = 0; i < 40; i++) {
            this._snowPatches.push({
                x: Math.random() * 800,
                y: Math.random() * 12,
                width: 20 + Math.random() * 40,
                height: 4 + Math.random() * 6,
                opacity: 0.4 + Math.random() * 0.5
            });
        }

        // Generate wet reflection areas for rain
        for (let i = 0; i < 35; i++) {
            this._wetReflections.push({
                x: Math.random() * 800,
                y: Math.random() * 18,
                width: 15 + Math.random() * 35,
                height: 1.5 + Math.random() * 2.5,
                opacity: 0.15 + Math.random() * 0.25,
                hue: 200 + Math.random() * 40 // Slight color variation
            });
        }
    }

    _generateCrack() {
        const segments = [];
        let x = Math.random() * 400;
        let y = Math.random() * 15;
        const numSegments = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < numSegments; i++) {
            segments.push({
                x1: x,
                y1: y,
                x2: x + (Math.random() - 0.5) * 8,
                y2: y + 3 + Math.random() * 5
            });
            x += (Math.random() - 0.5) * 8;
            y += 3 + Math.random() * 5;
        }
        return segments;
    }

    init() {
        this.offset = 0;
        this.currentDecoration = GROUND_DECORATIONS.NONE;
        this.targetDecoration = GROUND_DECORATIONS.NONE;
        this.decorationTransition = 0;
    }

    reset() {
        this.offset = 0;
        this.currentDecoration = GROUND_DECORATIONS.NONE;
        this.targetDecoration = GROUND_DECORATIONS.NONE;
        this.decorationTransition = 0;
    }

    update(groundSpeed) {
        this.offset = (this.offset + groundSpeed) % 24;
    }

    // Update ground decorations based on season and weather state
    updateDecorations(seasonManager) {
        if (!seasonManager) return;

        const prevDecoration = this.currentDecoration;
        
        // Determine target decoration based on season and weather
        const weatherState = seasonManager.getWeatherState();
        const currentSeason = seasonManager.getSeasonName ? seasonManager.getSeasonName() : 'spring';
        const weatherType = seasonManager.getCurrentWeatherType ? seasonManager.getCurrentWeatherType() : 'clear';

        // Determine the primary decoration based on season
        let seasonDecoration = GROUND_DECORATIONS.NONE;
        switch (currentSeason) {
            case 'spring':
                seasonDecoration = GROUND_DECORATIONS.SPRING_FLOWERS;
                break;
            case 'summer':
                seasonDecoration = GROUND_DECORATIONS.SUMMER_CRACKS;
                break;
            case 'autumn':
                seasonDecoration = GROUND_DECORATIONS.AUTUMN_LEAVES;
                break;
            case 'winter':
                seasonDecoration = GROUND_DECORATIONS.WINTER_SNOW;
                break;
        }

        // Override based on weather conditions
        if (weatherType === 'rain' || (weatherState && weatherState.raindrops && weatherState.raindrops.length > 10)) {
            this.targetDecoration = GROUND_DECORATIONS.RAIN_WET;
        } else if (weatherType === 'snow' || (weatherState && weatherState.snowflakes && weatherState.snowflakes.length > 10)) {
            this.targetDecoration = GROUND_DECORATIONS.SNOW_COVER;
        } else {
            this.targetDecoration = seasonDecoration;
        }

        // Handle transition
        if (this.targetDecoration !== this.currentDecoration) {
            this.decorationTransition = 1.0;
            this.currentDecoration = this.targetDecoration;
        }

        // Animate transition
        if (this.decorationTransition > 0) {
            this.decorationTransition = Math.max(0, this.decorationTransition - 0.02);
        }
    }

    draw(ctx, seasonManager) {
        let weatherState = null;
        let currentSeason = 'spring';
        let weatherType = 'clear';

        if (seasonManager) {
            // Get day-night state for ground colors
            const dayNight = seasonManager.getDayNightState();

            // Get weather information
            weatherState = seasonManager.getWeatherState();
            currentSeason = seasonManager.getSeasonName ? seasonManager.getSeasonName() : 'spring';
            weatherType = seasonManager.getCurrentWeatherType ? seasonManager.getCurrentWeatherType() : 'clear';

            // Update decorations based on current state
            this.updateDecorations(seasonManager);

            // Combine season colors with day-night lighting
            this._drawGroundBase(ctx, dayNight.groundBase);
            this._drawGroundTop(ctx, dayNight.groundTop, dayNight.groundBase);
            this._drawGroundPattern(ctx, dayNight.groundPattern);

            // Draw weather/season specific ground effects
            this._drawSeasonalEffects(ctx, currentSeason, weatherState, weatherType);
        } else {
            this._drawGroundBase(ctx);
            this._drawGroundTop(ctx);
            this._drawGroundPattern(ctx);
        }
    }

    _drawGroundBase(ctx, color) {
        // Rich warm earth tones for base ground
        const baseGrad = ctx.createLinearGradient(0, this.canvas.height - GROUND_HEIGHT, 0, this.canvas.height);
        if (color !== undefined) {
            baseGrad.addColorStop(0, color);
            baseGrad.addColorStop(1, '#8B4513');
        } else {
            baseGrad.addColorStop(0, '#A0522D');
            baseGrad.addColorStop(1, '#6B3410');
        }
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, GROUND_HEIGHT);
    }

    _drawGroundTop(ctx, topColor, baseColor) {
        // Smooth gradient from grassy top to earth below
        const tc = topColor !== undefined ? topColor : '#8B7355';
        const bc = baseColor !== undefined ? baseColor : '#A0522D';
        
        const groundGradient = ctx.createLinearGradient(0, this.canvas.height - GROUND_HEIGHT, 0, this.canvas.height - GROUND_HEIGHT + 25);
        groundGradient.addColorStop(0, tc);
        groundGradient.addColorStop(0.3, bc);
        groundGradient.addColorStop(1, '#6B3410');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, 25);

        // Add subtle grass line at top edge
        ctx.strokeStyle = topColor !== undefined ? topColor : '#8B7355';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height - GROUND_HEIGHT);
        ctx.lineTo(this.canvas.width, this.canvas.height - GROUND_HEIGHT);
        ctx.stroke();
    }

    _drawGroundPattern(ctx, color) {
        const c = color !== undefined ? color : '#7A6548';
        ctx.strokeStyle = c;
        ctx.lineWidth = 0.8;
        
        // Horizontal line for ground top edge definition
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height - GROUND_HEIGHT + 25);
        ctx.lineTo(this.canvas.width, this.canvas.height - GROUND_HEIGHT + 25);
        ctx.stroke();

        // Diagonal earth texture pattern
        for (let x = -this.offset; x < this.canvas.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, this.canvas.height - GROUND_HEIGHT + 28);
            ctx.lineTo(x + 15, this.canvas.height);
            ctx.stroke();
        }

        // Add subtle horizontal earth lines for depth
        for (let y = this.canvas.height - GROUND_HEIGHT + 30; y < this.canvas.height; y += 12) {
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Draw seasonal and weather-specific ground decorations
    _drawSeasonalEffects(ctx, season, weatherState, weatherType) {
        const groundY = this.canvas.height - GROUND_HEIGHT;
        const canvasWidth = this.canvas.width;

        switch (this.currentDecoration) {
            case GROUND_DECORATIONS.AUTUMN_LEAVES:
                this._drawAutumnLeaves(ctx, groundY, canvasWidth);
                break;
            case GROUND_DECORATIONS.WINTER_SNOW:
                this._drawWinterSnowGround(ctx, groundY, canvasWidth);
                break;
            case GROUND_DECORATIONS.SPRING_FLOWERS:
                this._drawSpringFlowers(ctx, groundY, canvasWidth);
                break;
            case GROUND_DECORATIONS.SUMMER_CRACKS:
                this._drawSummerCracks(ctx, groundY, canvasWidth);
                break;
            case GROUND_DECORATIONS.RAIN_WET:
                this._drawRainWetGround(ctx, groundY, canvasWidth, weatherState);
                break;
            case GROUND_DECORATIONS.SNOW_COVER:
                this._drawSnowCoveredGround(ctx, groundY, canvasWidth);
                break;
        }
    }

    // Autumn: Scattered leaves on the ground
    _drawAutumnLeaves(ctx, groundY, canvasWidth) {
        ctx.save();
        const scrollOffset = this.offset % 24;
        
        for (const leaf of this._groundLeaves) {
            // Calculate wrapped x position
            let drawX = ((leaf.x - scrollOffset * 2) % (canvasWidth + 50));
            if (drawX < -30) drawX += canvasWidth + 60;

            ctx.save();
            ctx.translate(drawX, groundY + leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = leaf.color;

            // Draw leaf shape based on type
            if (leaf.type === 0) {
                // Simple oval leaf
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size * 0.4, leaf.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (leaf.type === 1) {
                // Maple-like leaf with points
                this._drawMapleLeaf(ctx, leaf.size);
            } else {
                // Simple dot leaf
                ctx.beginPath();
                ctx.arc(0, 0, leaf.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
        
        ctx.restore();
    }

    _drawMapleLeaf(ctx, size) {
        const s = size * 0.4;
        ctx.beginPath();
        // Simple maple leaf shape
        ctx.moveTo(0, -s * 1.5);
        ctx.lineTo(s * 0.3, -s * 0.5);
        ctx.lineTo(s * 1.2, -s * 0.8);
        ctx.lineTo(s * 0.4, -s * 0.2);
        ctx.lineTo(s * 0.8, s * 0.5);
        ctx.lineTo(0, s * 0.2);
        ctx.lineTo(-s * 0.8, s * 0.5);
        ctx.lineTo(-s * 0.4, -s * 0.2);
        ctx.lineTo(-s * 1.2, -s * 0.8);
        ctx.lineTo(-s * 0.3, -s * 0.5);
        ctx.closePath();
        ctx.fill();
    }

    // Winter: Snow accumulation on ground
    _drawWinterSnowGround(ctx, groundY, canvasWidth) {
        ctx.save();
        
        // Draw snow layer on top of ground
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#F0F5FF';
        
        // Create uneven snow surface
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        
        // Wavy snow surface
        for (let x = 0; x <= canvasWidth; x += 10) {
            const waveY = groundY + Math.sin((x + this.offset * 3) * 0.05) * 2 + 
                          Math.sin((x + this.offset * 3) * 0.02) * 1.5;
            ctx.lineTo(x, waveY);
        }
        
        ctx.lineTo(canvasWidth, groundY + 8);
        ctx.lineTo(0, groundY + 8);
        ctx.closePath();
        ctx.fill();

        // Add snowflakes on the snow surface
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 40; i++) {
            let drawX = ((i * 17 + Math.sin(i) * 20) % canvasWidth);
            let drawY = groundY + 3 + Math.abs(Math.sin(i * 0.5)) * 4;
            
            ctx.beginPath();
            ctx.arc(drawX, drawY, 1.5 + Math.sin(i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    // Spring: Small flowers on the ground
    _drawSpringFlowers(ctx, groundY, canvasWidth) {
        ctx.save();
        const scrollOffset = this.offset % 24;
        
        for (const flower of this._groundFlowers) {
            let drawX = ((flower.x - scrollOffset * 1.5) % (canvasWidth + 50));
            if (drawX < -30) drawX += canvasWidth + 60;

            ctx.save();
            ctx.translate(drawX, groundY + flower.y);
            
            // Draw flower stem
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -flower.size * 0.5);
            ctx.stroke();

            // Draw flower petals
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = flower.color;
            const petalSize = flower.size * 0.25;
            for (let p = 0; p < flower.petalCount; p++) {
                const angle = (p / flower.petalCount) * Math.PI * 2;
                const px = Math.cos(angle) * petalSize * 1.5;
                const py = -flower.size * 0.5 + Math.sin(angle * 1.5) * petalSize * 1.5;
                ctx.beginPath();
                ctx.arc(px, py, petalSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Center of flower
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, -flower.size * 0.5, petalSize * 0.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
        
        ctx.restore();
    }

    // Summer: Ground cracks due to dryness
    _drawSummerCracks(ctx, groundY, canvasWidth) {
        ctx.save();
        const scrollOffset = this.offset % 24;
        
        for (const crack of this._groundCracks) {
            let drawX = ((crack[0]?.x1 ?? 0 - scrollOffset * 1.5) % (canvasWidth + 50));
            if (drawX < -30) drawX += canvasWidth + 60;

            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#5C3317';
            ctx.lineWidth = 1.5;

            for (const segment of crack) {
                ctx.beginPath();
                ctx.moveTo(drawX + segment.x1, groundY + segment.y1);
                ctx.lineTo(drawX + segment.x2, groundY + segment.y2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    // Rain: Wet/reflective ground surface
    _drawRainWetGround(ctx, groundY, canvasWidth, weatherState) {
        ctx.save();
        const scrollOffset = this.offset % 24;
        
        // Darken the ground slightly for wet look
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, groundY, canvasWidth, 18);
        
        ctx.globalAlpha = 1.0;

        // Draw reflections on wet surface
        if (weatherState && weatherState.raindrops) {
            const rainIntensity = Math.min(1, weatherState.raindrops.length / 50);
            
            for (const reflection of this._wetReflections) {
                let drawX = ((reflection.x - scrollOffset * 2) % (canvasWidth + 50));
                if (drawX < -30) drawX += canvasWidth + 60;

                ctx.globalAlpha = reflection.opacity * rainIntensity * 0.5;
                
                // Draw reflective highlight
                const gradient = ctx.createLinearGradient(drawX, groundY + reflection.y, 
                                                          drawX + reflection.width, groundY + reflection.y);
                gradient.addColorStop(0, 'rgba(200, 220, 255, 0)');
                gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.6)');
                gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(drawX, groundY + reflection.y, reflection.width, reflection.height);
            }

            // Add raindrop ripple effects on wet ground
            this._drawRainRipples(ctx, groundY, canvasWidth, weatherState);
        }
        
        ctx.restore();
    }

    _drawRainRipples(ctx, groundY, canvasWidth, weatherState) {
        const frameCount = Math.floor(Date.now() / 100); // Use time-based frame count
        
        // Generate ripples based on rain intensity
        const rippleCount = Math.floor((weatherState?.raindrops?.length || 0) / 5);
        
        for (let i = 0; i < Math.min(rippleCount, 15); i++) {
            // Use pseudo-random based on index and frame to create animated ripples
            const seed = i * 7 + frameCount % 100;
            let drawX = ((seed * 13.7) % canvasWidth);
            let rippleY = groundY + 5 + ((seed * 3.1) % 10);
            
            // Ripple animation - expand and fade
            const ripplePhase = (frameCount + i * 20) % 40;
            const rippleRadius = ripplePhase * 0.5;
            const rippleOpacity = Math.max(0, 0.3 * (1 - ripplePhase / 40));
            
            if (rippleRadius > 0.5) {
                ctx.save();
                ctx.globalAlpha = rippleOpacity;
                ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(drawX, rippleY, rippleRadius * 1.5, rippleRadius * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    // Snow covered ground (during snowfall)
    _drawSnowCoveredGround(ctx, groundY, canvasWidth) {
        ctx.save();
        
        // Heavy snow layer
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#F5F8FF';
        
        // Snow surface with gentle waves
        ctx.beginPath();
        ctx.moveTo(0, groundY - 3);
        
        for (let x = 0; x <= canvasWidth; x += 8) {
            const waveY = groundY - 3 + Math.sin((x + this.offset * 2) * 0.04) * 1.5;
            ctx.lineTo(x, waveY);
        }
        
        ctx.lineTo(canvasWidth, groundY + 15);
        ctx.lineTo(0, groundY + 15);
        ctx.closePath();
        ctx.fill();

        // Snow texture - small bumps and details
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 30; i++) {
            let drawX = ((i * 19 + Math.cos(i) * 25) % canvasWidth);
            let drawY = groundY + Math.abs(Math.sin(i * 0.7)) * 8;
            
            ctx.beginPath();
            ctx.arc(drawX, drawY, 1 + Math.sin(i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
