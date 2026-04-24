// Background and Cloud Rendering
import { GROUND_HEIGHT } from '../config/constants.js';

// ============================================================
// CELESTIAL BODIES - Animated sun and moon across the sky
// ============================================================
class CelestialBodies {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        // Sun orbit: starts at right horizon at dawn, peaks at top at day, sets at right at evening
        this.sunAngle = 0; // 0 = dawn (right side), PI/2 = noon (top), PI = dusk (left side)
        // Moon orbit: opposite of sun
        this.moonAngle = Math.PI;
        this.sunX = 0;
        this.sunY = 0;
        this.moonX = 0;
        this.moonY = 0;
    }

    // Update positions based on day-night phase (0-1, where 0=dawn, 0.25=day, 0.5=evening, 0.75=midnight)
    update(dayPhase) {
        // Map day phase to sun angle: 0=dawn(right), 0.25=noon(top), 0.5=dusk(left), 0.75=midnight(bottom), 1=dawn(right)
        const sunAngle = dayPhase * Math.PI * 2;
        const centerX = this.canvasWidth * 0.5;
        const centerY = this.canvasHeight * 0.35;
        const radiusX = this.canvasWidth * 0.45;
        const radiusY = this.canvasHeight * 0.35;

        // Sun position (semi-circle arc across the top)
        this.sunX = centerX + Math.cos(sunAngle) * radiusX;
        this.sunY = centerY - Math.sin(sunAngle) * radiusY;

        // Moon position (opposite of sun)
        const moonAngle = (dayPhase + 0.5) * Math.PI * 2;
        this.moonX = centerX + Math.cos(moonAngle) * radiusX;
        this.moonY = centerY - Math.sin(moonAngle) * radiusY;
    }

    isAboveHorizon(x, y) {
        return y > 0 && y < this.canvasHeight * 0.6;
    }
}

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
        this.celestialBodies = new CelestialBodies(canvas.width, canvas.height);
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
        // Always update clouds (even when not playing) for continuous animation
        this.clouds.forEach(cloud => {
            cloud.update(groundSpeed);
        });
    }

    draw(ctx, seasonManager) {
        this.drawSky(ctx, seasonManager);
        this.drawClouds(ctx, seasonManager);
        seasonManager.drawWeather(ctx);
    }

    drawSky(ctx, seasonManager) {
        // Get day-night state for sky colors
        const dayNight = seasonManager.getDayNightState();

        // Use day-night interpolated sky gradient (combines season + day/night)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height - GROUND_HEIGHT);
        skyGradient.addColorStop(0, dayNight.skyGradient[0]);
        skyGradient.addColorStop(1, dayNight.skyGradient[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - GROUND_HEIGHT);

        // Update celestial body positions based on day-night phase from seasonManager
        const dayNightPhase = seasonManager.getDayNightPhase();
        this.celestialBodies.update(dayNightPhase);

        // Draw stars (visible during night/midnight)
        if (dayNight.starOpacity > 0.05) {
            this.drawStars(ctx, dayNight.starOpacity);
        }

        // Draw moon (visible when moon color has alpha > 0.1)
        const moonColor = dayNight.moonColor;
        const moonAlpha = this.extractAlpha(moonColor);
        if (moonAlpha > 0.1) {
            this.drawMoon(ctx, dayNight.moonColor);
        }

        // Draw sun (visible when sun color alpha > 0.1)
        const sunColor = dayNight.sunColor;
        const sunAlpha = this.extractAlpha(sunColor);
        if (sunAlpha > 0.1) {
            this.drawSun(ctx, dayNight.sunColor);
        }
    }

    extractAlpha(colorStr) {
        const match = colorStr.match(/[\d.]+/g);
        if (match && match.length >= 4) {
            return parseFloat(match[3]);
        }
        return 0;
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
        // Skip if moon is below horizon
        if (this.celestialBodies.moonY > this.canvas.height * 0.6) return;

        const moonX = this.celestialBodies.moonX;
        const moonY = this.celestialBodies.moonY;
        const moonRadius = 25;

        ctx.save();

        // Draw moon glow
        const glowGradient = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2.5);
        glowGradient.addColorStop(0, 'rgba(200, 220, 255, 0.25)');
        glowGradient.addColorStop(0.6, 'rgba(200, 220, 255, 0.08)');
        glowGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw moon body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters (subtle)
        ctx.fillStyle = 'rgba(180, 190, 200, 0.25)';
        ctx.beginPath();
        ctx.arc(moonX - 6, moonY - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 7, moonY + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 2, moonY + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSun(ctx, color) {
        // Skip if sun is below horizon
        if (this.celestialBodies.sunY > this.canvas.height * 0.55) return;

        const sunX = this.celestialBodies.sunX;
        const sunY = this.celestialBodies.sunY;
        const sunRadius = 30;

        ctx.save();

        // Draw sun glow (multi-layered for realistic effect)
        const glowGradient3 = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 5);
        glowGradient3.addColorStop(0, 'rgba(255, 220, 100, 0.15)');
        glowGradient3.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = glowGradient3;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 5, 0, Math.PI * 2);
        ctx.fill();

        const glowGradient2 = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 3);
        glowGradient2.addColorStop(0, 'rgba(255, 200, 50, 0.35)');
        glowGradient2.addColorStop(0.5, 'rgba(255, 150, 30, 0.1)');
        glowGradient2.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGradient2;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw sun body (bright warm white/yellow)
        const sunBodyGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        sunBodyGradient.addColorStop(0, '#FFF8E0');
        sunBodyGradient.addColorStop(0.5, '#FFD700');
        sunBodyGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = sunBodyGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawClouds(ctx, seasonManager) {
        const sortedLayers = [...PARALLAX_LAYERS].sort((a, b) => a.speedMultiplier - b.speedMultiplier);

        for (const layer of sortedLayers) {
            const layerClouds = this.clouds.filter(c => c.parallaxLayer === layer);
            for (const cloud of layerClouds) {
                cloud.draw(ctx, seasonManager.currentCloudColor);
            }
        }
    }
}
