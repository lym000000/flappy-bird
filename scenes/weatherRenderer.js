// Weather & Transition Particle Renderer
// Draws all weather effects and season transition particles on canvas
import { GROUND_HEIGHT } from '../config/constants.js';

export class WeatherRenderer {
    constructor() {
        this.transitionParticles = [];
    }

    setTransitionParticles(particles) {
        this.transitionParticles = particles;
    }

    draw(ctx, canvasWidth, canvasHeight, weatherState, seasonColors) {
        if (!weatherState) return;

        // Thunder flash
        if (weatherState.thunderFlash > 0.01) {
            ctx.save();
            ctx.globalAlpha = weatherState.thunderFlash * 0.6;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.restore();

            this._drawLightningBolts(ctx, weatherState.lightningBolts);
        }

        // Rain
        if (weatherState.raindrops.length > 0) {
            this._drawRain(ctx, weatherState.raindrops);
        }

        // Snowflakes
        if (weatherState.snowflakes.length > 0) {
            this._drawSnow(ctx, weatherState.snowflakes);
        }

        // Wind particles
        if (weatherState.windParticles.length > 0) {
            this._drawWind(ctx, weatherState.windParticles);
        }

        // Autumn leaf particles
        if (weatherState.leafParticles.length > 0) {
            this._drawLeaves(ctx, weatherState.leafParticles);
        }

        // Ice crystals
        if (weatherState.iceCrystals.length > 0) {
            this._drawIceCrystals(ctx, weatherState.iceCrystals);
        }

        // Transition particles
        if (this.transitionParticles.length > 0) {
            this._drawTransitionParticles(ctx);
        }
    }

    _drawRain(ctx, raindrops) {
        ctx.save();
        for (const drop of raindrops) {
            ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - drop.windOffset, drop.y + drop.length);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawSnow(ctx, snowflakes) {
        ctx.save();
        for (const snow of snowflakes) {
            ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
            ctx.beginPath();
            ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawWind(ctx, windParticles) {
        ctx.save();
        for (const wind of windParticles) {
            ctx.strokeStyle = `rgba(200, 200, 200, ${wind.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wind.x, wind.y + wind.yOffset);
            ctx.lineTo(wind.x - wind.length, wind.y + wind.yOffset);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawLeaves(ctx, leaves) {
        ctx.save();
        for (const leaf of leaves) {
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size * 0.4, leaf.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, -leaf.size * 0.7);
            ctx.lineTo(0, leaf.size * 0.7);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    _drawIceCrystals(ctx, crystals) {
        ctx.save();
        for (const crystal of crystals) {
            ctx.fillStyle = `rgba(200, 220, 255, ${crystal.opacity})`;
            ctx.translate(crystal.x, crystal.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-crystal.size / 2, -crystal.size / 2, crystal.size, crystal.size);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.restore();
    }

    _drawLightningBolts(ctx, bolts) {
        if (bolts.length === 0) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(200, 200, 255, 0.8)';
        ctx.shadowBlur = 15;

        for (const bolt of bolts) {
            ctx.beginPath();
            ctx.moveTo(bolt.x1, bolt.y1);
            ctx.lineTo(bolt.x2, bolt.y2);
            ctx.stroke();

            const midX = (bolt.x1 + bolt.x2) / 2;
            const midY = (bolt.y1 + bolt.y2) / 2;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + (Math.random() - 0.5) * 30, midY + 20);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawTransitionParticles(ctx) {
        const particles = this.transitionParticles;
        if (particles.length === 0) return;

        ctx.save();
        for (const p of particles) {
            const alpha = Math.min(1, p.life / (p.maxLife * 0.3));

            if (p.type === 'petal' || p.type === 'leaf') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                if (p.type === 'petal') {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.3, p.size * 0.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.7, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (p.type === 'heat') {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'iceCrystal') {
                ctx.globalAlpha = alpha * 0.6;
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
        }
        ctx.restore();
    }
}
