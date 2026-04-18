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
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height - GROUND_HEIGHT);
        skyGradient.addColorStop(0, seasonCycle.currentSkyGradient[0]);
        skyGradient.addColorStop(1, seasonCycle.currentSkyGradient[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - GROUND_HEIGHT);
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