// Background and Cloud Rendering
import { GROUND_HEIGHT } from '../config/constants.js';

// ============================================================
// PARALLAX CLOUD CONFIGURATION
// ============================================================
const PARALLAX_LAYERS = [
    { speedMultiplier: 0.1, minSpacing: 300, yRange: [30, 120], scaleRange: [0.5, 0.8] },
    { speedMultiplier: 0.25, minSpacing: 250, yRange: [80, 180], scaleRange: [0.4, 0.7] },
    { speedMultiplier: 0.4, minSpacing: 200, yRange: [20, 100], scaleRange: [0.6, 1.0] }
];

// ============================================================
// PARALLAX CLOUDS
// ============================================================
export class Cloud {
    constructor(x, y, scale, parallaxLayer) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.parallaxLayer = parallaxLayer;
        this.width = 90;
        this.height = 60;
    }

    update(speed) {
        this.x -= speed * this.parallaxLayer.speedMultiplier;
        if (this.x < -this.width * this.scale * 2) {
            this.x = this.parallaxLayer.canvasWidth + Math.random() * 100;
            this.y = this.parallaxLayer.yRange[0] + Math.random() * (this.parallaxLayer.yRange[1] - this.parallaxLayer.yRange[0]);
            this.scale = this.parallaxLayer.scaleRange[0] + Math.random() * (this.parallaxLayer.scaleRange[1] - this.parallaxLayer.scaleRange[0]);
        }
    }

    draw(ctx, cloudColor) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = cloudColor;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.arc(30, -10, 25, 0, Math.PI * 2);
        ctx.arc(60, 0, 30, 0, Math.PI * 2);
        ctx.arc(30, 10, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ============================================================
// BACKGROUND CLASS
// ============================================================
export class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.clouds = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        PARALLAX_LAYERS.forEach(layer => {
            layer.canvasWidth = this.canvas.width;
        });

        PARALLAX_LAYERS.forEach(layer => {
            const cloudCount = Math.ceil(this.canvas.width / layer.minSpacing) + 2;
            for (let i = 0; i < cloudCount; i++) {
                const x = i * layer.minSpacing + Math.random() * 100;
                const y = layer.yRange[0] + Math.random() * (layer.yRange[1] - layer.yRange[0]);
                const scale = layer.scaleRange[0] + Math.random() * (layer.scaleRange[1] - layer.scaleRange[0]);
                const cloud = new Cloud(x, y, scale, layer);
                this.clouds.push(cloud);
            }
        });

        this.initialized = true;
    }

    reset() {
        this.clouds = [];
        this.initialized = false;
    }

    update(groundSpeed) {
        this.clouds.forEach(cloud => {
            cloud.update(groundSpeed);
        });
    }

    draw(ctx, seasonCycle) {
        this.drawSky(ctx, seasonCycle);
        this.drawClouds(ctx, seasonCycle);
        seasonCycle.drawWeather(ctx);
    }

    drawSky(ctx, seasonCycle) {
        // Get day-night state for sky colors
        const dayNight = seasonCycle.getDayNightState();

        // Use day-night interpolated sky gradient (combines season + day/night)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height - GROUND_HEIGHT);
        skyGradient.addColorStop(0, dayNight.skyGradient[0]);
        skyGradient.addColorStop(1, dayNight.skyGradient[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - GROUND_HEIGHT);

        // Draw stars (visible during night/midnight)
        if (dayNight.starOpacity > 0.05) {
            this.drawStars(ctx, dayNight.starOpacity);
        }

        // Draw moon (visible during evening/midnight/dawn)
        const moonColor = dayNight.moonColor;
        if (moonColor && moonColor.includes('0.') && parseFloat(moonColor.split(', ')[2]) > 100) {
            this.drawMoon(ctx, dayNight.moonColor);
        }

        // Draw sun (visible during day/dawn)
        const sunColor = dayNight.sunColor;
        if (sunColor && sunColor.includes('255') && parseFloat(sunColor.split(', ')[0]) > 200) {
            this.drawSun(ctx, dayNight.sunColor);
        }
    }

    drawStars(ctx, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;

        // Generate consistent star positions using simple seeded approach
        const starCount = 50;
        const seed = 42; // Fixed seed for consistent positions
        for (let i = 0; i < starCount; i++) {
            // Simple pseudo-random for consistent positions
            const x = ((Math.sin(i * 127.1 + seed) * 43758.5453) % 1 + 1) % 1 * this.canvas.width;
            const y = ((Math.sin(i * 268.9 + seed) * 18456.234) % 1 + 1) % 1 * (this.canvas.height - 80) * 0.5;

            // Stars twinkle
            const twinkle = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + i);
            const starOpacity = opacity * twinkle;

            ctx.fillStyle = `rgba(255, 255, 240, ${starOpacity})`;
            ctx.beginPath();
            ctx.arc(Math.abs(x) % this.canvas.width, Math.abs(y) % (this.canvas.height * 0.4), 1 + (i % 2) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawMoon(ctx, color) {
        ctx.save();

        // Moon position (upper right area)
        const moonX = this.canvas.width * 0.75;
        const moonY = this.canvas.height * 0.12;
        const moonRadius = 25;

        // Draw moon glow
        const glowGradient = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2);
        glowGradient.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
        glowGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw moon body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters
        ctx.fillStyle = 'rgba(180, 190, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 8, moonY + 5, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSun(ctx, color) {
        ctx.save();

        // Sun position (lower right during day, horizon during dawn)
        const sunX = this.canvas.width * 0.8;
        const sunY = this.canvas.height * 0.15;
        const sunRadius = 30;

        // Draw sun glow
        const glowGradient = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 3);
        glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
        glowGradient.addColorStop(0.5, 'rgba(255, 150, 30, 0.1)');
        glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw sun body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawClouds(ctx, seasonCycle) {
        const sortedLayers = [...PARALLAX_LAYERS].sort((a, b) => a.speedMultiplier - b.speedMultiplier);

        for (const layer of sortedLayers) {
            const layerClouds = this.clouds.filter(c => c.parallaxLayer === layer);
            for (const cloud of layerClouds) {
                cloud.draw(ctx, seasonCycle.currentCloudColor);
            }
        }
    }
}