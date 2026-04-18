// Season Cycle Manager
// Handles season transitions, color interpolation, and delegates weather rendering
import { GROUND_HEIGHT, SEASONS, WEATHER_TYPES } from '../config/constants.js';

// ============================================================
// SEASON CYCLE MANAGER
// ============================================================
export class SeasonCycleManager {
    constructor() {
        this.currentSeasonIndex = 0;
        this.nextSeasonIndex = 1;
        this.progress = 0;
        this.elapsedFrames = 0;
        this.currentSeason = SEASONS[0];
        this.nextSeason = SEASONS[1];
        this.seasonTransitionAlpha = 0;

        // Current interpolated values for rendering
        this.currentSkyGradient = [...SEASONS[0].skyGradient];
        this.currentCloudColor = SEASONS[0].cloudColor;
        this.currentGroundBase = SEASONS[0].groundBase;
        this.currentGroundTop = SEASONS[0].groundTop;
        this.currentGroundPattern = SEASONS[0].groundPattern;
        this.currentFoliageColor = SEASONS[0].foliageColor;
        this.currentFlowerColors = [...SEASONS[0].flowerColors];
        this.currentAmbientLight = SEASONS[0].ambientLight;
        this.currentCloudDensity = SEASONS[0].cloudDensity;
        this.currentWeatherConfig = WEATHER_TYPES.springWeather;

        // Weather state (delegated to weather.js for rendering)
        this.weatherState = {
            raindrops: [],
            snowflakes: [],
            windParticles: [],
            thunderFlash: 0,
            thunderTimer: 0,
            isThundering: false,
            lightningBolts: [],
            windStrength: 0.5,
            leafParticles: [],
            iceCrystals: []
        };

        // Season transition particles
        this.transitionParticles = [];

        this.canvasWidth = 400;
        this.canvasHeight = 600;
        this.initialized = false;
    }

    init(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.initWeatherParticles();
        this.initialized = true;
    }

    initWeatherParticles() {
        this.weatherState.raindrops = [];
        this.weatherState.snowflakes = [];
        this.weatherState.windParticles = [];
        this.weatherState.leafParticles = [];
        this.weatherState.iceCrystals = [];
    }

    reset() {
        this.currentSeasonIndex = 0;
        this.nextSeasonIndex = 1;
        this.progress = 0;
        this.elapsedFrames = 0;
        this.seasonTransitionAlpha = 0;
        this.currentSeason = SEASONS[0];
        this.nextSeason = SEASONS[1];
        this.currentWeatherConfig = WEATHER_TYPES.springWeather;
        this.initWeatherParticles();
        this.transitionParticles = [];
    }

    getSeasonName() {
        return this.currentSeason.name;
    }

    getCurrentWeatherType() {
        return this.currentWeatherConfig.primary;
    }

    update(frameCount = 0) {
        if (!this.initialized) return;

        this.elapsedFrames++;

        const currentSeasonConfig = SEASONS[this.currentSeasonIndex];
        const seasonDuration = currentSeasonConfig.duration;

        this.progress = Math.min(this.elapsedFrames / seasonDuration, 1);

        if (this.progress >= 1) {
            this.transitionToNextSeason();
        }

        this.updateWeather(frameCount);

        if (this.seasonTransitionAlpha > 0) {
            this.seasonTransitionAlpha = Math.max(0, this.seasonTransitionAlpha - 0.005);
        }

        this.updateTransitionParticles();
    }

    transitionToNextSeason() {
        this.currentSeasonIndex = this.nextSeasonIndex;
        this.nextSeasonIndex = (this.nextSeasonIndex + 1) % SEASONS.length;

        this.elapsedFrames = 0;
        this.progress = 0;

        this.currentSeason = SEASONS[this.currentSeasonIndex];
        this.nextSeason = SEASONS[this.nextSeasonIndex];
        this.currentWeatherConfig = WEATHER_TYPES[this.currentSeason.weatherSystem];

        this.seasonTransitionAlpha = 1.0;

        this.generateTransitionParticles();
        this.initWeatherParticles();
    }

    generateTransitionParticles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            let particle = null;
            const x = Math.random() * this.canvasWidth;
            const y = Math.random() * this.canvasHeight * 0.6;

            switch (this.nextSeason.id) {
                case 'spring':
                    particle = {
                        x: -20,
                        y: Math.random() * this.canvasHeight * 0.5,
                        vx: 1.5 + Math.random() * 1.5,
                        vy: 0.5 + Math.random() * 1,
                        size: 3 + Math.random() * 4,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.1,
                        color: this.nextSeason.flowerColors[Math.floor(Math.random() * this.nextSeason.flowerColors.length)],
                        life: 300 + Math.random() * 200,
                        maxLife: 500,
                        type: 'petal',
                        wobbleSpeed: 0.02 + Math.random() * 0.02,
                        wobbleAmount: 0.5 + Math.random() * 0.5
                    };
                    break;
                case 'summer':
                    particle = {
                        x: x,
                        y: this.canvasHeight - GROUND_HEIGHT - Math.random() * 100,
                        vx: 0,
                        vy: -0.3 - Math.random() * 0.3,
                        size: 2 + Math.random() * 3,
                        color: 'rgba(255, 200, 50, 0.3)',
                        life: 60 + Math.random() * 40,
                        maxLife: 100,
                        type: 'heat'
                    };
                    break;
                case 'autumn':
                    const leafColors = ['#FF4500', '#FF6347', '#FF8C00', '#CD853F', '#8B4513'];
                    particle = {
                        x: -10,
                        y: Math.random() * this.canvasHeight * 0.4,
                        vx: 2 + Math.random() * 2,
                        vy: 1 + Math.random() * 1.5,
                        size: 5 + Math.random() * 6,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: 0.05 + Math.random() * 0.1,
                        color: leafColors[Math.floor(Math.random() * leafColors.length)],
                        life: 200 + Math.random() * 150,
                        maxLife: 350,
                        type: 'leaf',
                        wobbleSpeed: 0.03 + Math.random() * 0.03,
                        wobbleAmount: 1 + Math.random() * 1.5
                    };
                    break;
                case 'winter':
                    particle = {
                        x: Math.random() * this.canvasWidth,
                        y: -10,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: 0.5 + Math.random() * 1.5,
                        size: 1 + Math.random() * 3,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.05,
                        color: 'rgba(200, 220, 255, 0.7)',
                        life: 300 + Math.random() * 200,
                        maxLife: 500,
                        type: 'iceCrystal'
                    };
                    break;
            }

            if (particle) {
                this.transitionParticles.push(particle);
            }
        }
    }

    updateTransitionParticles() {
        this.transitionParticles = this.transitionParticles.filter(p => p.life > 0);
        for (const p of this.transitionParticles) {
            p.life--;
            if (p.type === 'petal' || p.type === 'leaf') {
                p.x += p.vx + Math.sin(p.wobbleSpeed * (p.maxLife - p.life)) * p.wobbleAmount;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
            }
        }
    }

    updateWeather(frameCount) {
        const weather = this.currentWeatherConfig;

        this.weatherState.thunderTimer++;
        if (this.weatherState.thunderTimer >= weather.thunderInterval) {
            this.weatherState.thunderTimer = 0;
            if (Math.random() < weather.secondaryChance.thunder || weather.primary === 'thunder') {
                this.weatherState.isThundering = true;
                this.weatherState.thunderFlash = 1.0;
                this.generateLightningBolt();
            }
        }

        if (this.weatherState.thunderFlash > 0) {
            this.weatherState.thunderFlash *= 0.85;
            if (this.weatherState.thunderFlash < 0.01) {
                this.weatherState.thunderFlash = 0;
                this.weatherState.isThundering = false;
                this.weatherState.lightningBolts = [];
            }
        }

        this.weatherState.windStrength = weather.windStrength;

        this.generateWeatherParticles(weather, frameCount);
        this.updateWeatherParticles(weather);
    }

    generateWeatherParticles(weather, frameCount) {
        const canvasWidth = this.canvasWidth;
        const canvasHeight = this.canvasHeight;

        if (weather.primary === 'rain' || weather.secondaryChance.rain > 0) {
            const rainCount = Math.floor(weather.rainDensity * 5);
            for (let i = 0; i < rainCount; i++) {
                if (Math.random() < 0.3) {
                    this.weatherState.raindrops.push({
                        x: canvasWidth + Math.random() * 100 + this.weatherState.windStrength * 20,
                        y: -10,
                        length: 10 + Math.random() * 15,
                        speed: weather.rainSpeed * (0.8 + Math.random() * 0.4),
                        opacity: 0.3 + Math.random() * 0.4,
                        windOffset: this.weatherState.windStrength * 3
                    });
                }
            }
        }

        if (weather.primary === 'snow') {
            const snowCount = Math.floor(weather.rainDensity * 4);
            for (let i = 0; i < snowCount; i++) {
                if (Math.random() < 0.2) {
                    this.weatherState.snowflakes.push({
                        x: Math.random() * canvasWidth,
                        y: -5,
                        size: 1.5 + Math.random() * 3.5,
                        speed: weather.rainSpeed * (0.5 + Math.random() * 0.5),
                        wobble: Math.random() * Math.PI * 2,
                        wobbleSpeed: 0.02 + Math.random() * 0.03,
                        opacity: 0.5 + Math.random() * 0.4
                    });
                }
            }
        }

        if (weather.primary === 'wind' || weather.windStrength > 1.5) {
            const windCount = Math.floor(weather.windStrength * 2);
            for (let i = 0; i < windCount; i++) {
                if (Math.random() < 0.15) {
                    this.weatherState.windParticles.push({
                        x: canvasWidth + Math.random() * 50,
                        y: Math.random() * canvasHeight * 0.7,
                        length: 30 + Math.random() * 60,
                        speed: 4 + weather.windStrength * 2,
                        opacity: 0.1 + Math.random() * 0.15,
                        yOffset: Math.random() * 20 - 10
                    });
                }
            }
        }

        if (weather.primary === 'wind' && this.currentSeason.id === 'autumn') {
            if (Math.random() < 0.08) {
                const leafColors = ['#FF4500', '#FF6347', '#FF8C00', '#CD853F', '#8B4513'];
                this.weatherState.leafParticles.push({
                    x: canvasWidth + 20,
                    y: Math.random() * canvasHeight * 0.4,
                    size: 4 + Math.random() * 5,
                    speed: 2 + weather.windStrength * 1.5,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: 0.05 + Math.random() * 0.15,
                    color: leafColors[Math.floor(Math.random() * leafColors.length)],
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.03 + Math.random() * 0.04,
                    wobbleAmount: 1.5 + Math.random() * 1.5
                });
            }
        }

        if (this.currentSeason.id === 'winter' && Math.random() < 0.05) {
            this.weatherState.iceCrystals.push({
                x: Math.random() * canvasWidth,
                y: -5,
                size: 1 + Math.random() * 2,
                speed: 0.5 + Math.random() * 1,
                drift: (Math.random() - 0.5) * 0.5,
                opacity: 0.3 + Math.random() * 0.3
            });
        }

        const maxRaindrops = 150;
        const maxSnowflakes = 200;
        const maxWindParticles = 40;
        const maxLeafParticles = 25;
        const maxIceCrystals = 80;

        if (this.weatherState.raindrops.length > maxRaindrops) {
            this.weatherState.raindrops.splice(0, this.weatherState.raindrops.length - maxRaindrops);
        }
        if (this.weatherState.snowflakes.length > maxSnowflakes) {
            this.weatherState.snowflakes.splice(0, this.weatherState.snowflakes.length - maxSnowflakes);
        }
        if (this.weatherState.windParticles.length > maxWindParticles) {
            this.weatherState.windParticles.splice(0, this.weatherState.windParticles.length - maxWindParticles);
        }
        if (this.weatherState.leafParticles.length > maxLeafParticles) {
            this.weatherState.leafParticles.splice(0, this.weatherState.leafParticles.length - maxLeafParticles);
        }
        if (this.weatherState.iceCrystals.length > maxIceCrystals) {
            this.weatherState.iceCrystals.splice(0, this.weatherState.iceCrystals.length - maxIceCrystals);
        }
    }

    updateWeatherParticles(weather) {
        const canvasHeight = this.canvasHeight;
        const canvasWidth = this.canvasWidth;

        this.weatherState.raindrops = this.weatherState.raindrops.filter(r => {
            r.y += r.speed;
            r.x -= r.windOffset;
            return r.y < canvasHeight && r.x > -50;
        });

        this.weatherState.snowflakes = this.weatherState.snowflakes.filter(s => {
            s.wobble += s.wobbleSpeed;
            s.y += s.speed;
            s.x += Math.sin(s.wobble) * 1.5;
            s.x += this.weatherState.windStrength * 0.3;
            return s.y < canvasHeight && s.x > -20 && s.x < canvasWidth + 20;
        });

        this.weatherState.windParticles = this.weatherState.windParticles.filter(w => {
            w.x -= w.speed;
            return w.x > -w.length;
        });

        this.weatherState.leafParticles = this.weatherState.leafParticles.filter(l => {
            l.wobble += l.wobbleSpeed;
            l.x -= l.speed + Math.sin(l.wobble) * l.wobbleAmount;
            l.y += 0.5 + Math.random() * 0.5;
            l.rotation += l.rotationSpeed;
            return l.x > -30 && l.y < canvasHeight;
        });

        this.weatherState.iceCrystals = this.weatherState.iceCrystals.filter(ic => {
            ic.y += ic.speed;
            ic.x += ic.drift + this.weatherState.windStrength * 0.2;
            return ic.y < canvasHeight;
        });
    }

    generateLightningBolt() {
        const segments = [];
        let currentX = Math.random() * this.canvasWidth;
        let currentY = 0;
        const canvasHeight = this.canvasHeight - GROUND_HEIGHT;

        while (currentY < canvasHeight) {
            const nextY = currentY + 20 + Math.random() * 40;
            const offsetX = (Math.random() - 0.5) * 60;
            segments.push({
                x1: currentX + (Math.random() - 0.5) * 30,
                y1: currentY,
                x2: currentX + offsetX,
                y2: nextY
            });
            currentX = currentX + offsetX;
            currentY = nextY;
        }

        this.weatherState.lightningBolts = segments;
    }

    getWeatherState() {
        return this.weatherState;
    }

    interpolateColor(color1, color2, factor) {
        const hex = (color) => {
            if (color.startsWith('rgba') || color.startsWith('rgb')) {
                const match = color.match(/[\d.]+/g);
                if (!match) return [0, 0, 0];
                return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
            }
            const result = parseInt(color.slice(1), 16);
            return [(result >> 16) & 255, (result >> 8) & 255, result & 255];
        };

        const c1 = hex(color1);
        const c2 = hex(color2);

        const r = Math.round(c1[0] + (c2[0] - c1[0]) * factor);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * factor);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    parseRgba(colorStr) {
        const match = colorStr.match(/[\d.]+/g);
        if (!match) return { r: 0, g: 0, b: 0, a: 0 };
        return {
            r: parseFloat(match[0]),
            g: parseFloat(match[1]),
            b: parseFloat(match[2]),
            a: parseFloat(match[3])
        };
    }

    interpolateRgba(color1, color2, factor) {
        const c1 = this.parseRgba(color1);
        const c2 = this.parseRgba(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = c1.a + (c2.a - c1.a) * factor;

        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }

    getInterpolatedValues(time = 0) {
        const current = this.currentSeason;
        const next = this.nextSeason;
        const transitionFactor = this.seasonTransitionAlpha;

        if (transitionFactor <= 0) {
            this.currentSkyGradient = [...current.skyGradient];
            this.currentCloudColor = current.cloudColor;
            this.currentGroundBase = current.groundBase;
            this.currentGroundTop = current.groundTop;
            this.currentGroundPattern = current.groundPattern;
            this.currentFoliageColor = current.foliageColor;
            this.currentFlowerColors = [...current.flowerColors];
            this.currentAmbientLight = current.ambientLight;
            this.currentCloudDensity = current.cloudDensity;
            this.currentWeatherConfig = WEATHER_TYPES[current.weatherSystem];
            return;
        }

        this.currentSkyGradient = [
            this.interpolateColor(current.skyGradient[0], next.skyGradient[0], transitionFactor),
            this.interpolateColor(current.skyGradient[1], next.skyGradient[1], transitionFactor)
        ];

        this.currentCloudColor = this.interpolateRgba(
            current.cloudColor,
            next.cloudColor,
            transitionFactor
        );

        this.currentGroundBase = this.interpolateColor(
            current.groundBase,
            next.groundBase,
            transitionFactor
        );
        this.currentGroundTop = this.interpolateColor(
            current.groundTop,
            next.groundTop,
            transitionFactor
        );
        this.currentGroundPattern = this.interpolateColor(
            current.groundPattern,
            next.groundPattern,
            transitionFactor
        );

        this.currentFoliageColor = this.interpolateColor(
            current.foliageColor,
            next.foliageColor,
            transitionFactor
        );
        this.currentFlowerColors = current.flowerColors.map((color, i) => {
            const nextColor = next.flowerColors[i % next.flowerColors.length];
            return this.interpolateColor(color, nextColor, transitionFactor);
        });

        this.currentAmbientLight = current.ambientLight +
            (next.ambientLight - current.ambientLight) * transitionFactor;

        this.currentCloudDensity = current.cloudDensity +
            (next.cloudDensity - current.cloudDensity) * transitionFactor;

        this.currentWeatherConfig = WEATHER_TYPES[current.weatherSystem];
    }

    // Draw all weather effects on canvas
    drawWeather(ctx) {
        const weatherState = this.getWeatherState();
        const weather = this.currentWeatherConfig;

        // Draw thunder flash
        if (weatherState.thunderFlash > 0.01) {
            ctx.save();
            ctx.globalAlpha = weatherState.thunderFlash * 0.6;
            ctx.fillStyle = weather.thunderFlashColor || 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.restore();

            this.drawLightningBolts(ctx, weatherState.lightningBolts);
        }

        // Draw rain
        if (weatherState.raindrops.length > 0) {
            ctx.save();
            for (const drop of weatherState.raindrops) {
                ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - drop.windOffset, drop.y + drop.length);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw snowflakes
        if (weatherState.snowflakes.length > 0) {
            ctx.save();
            for (const snow of weatherState.snowflakes) {
                ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
                ctx.beginPath();
                ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw wind particles
        if (weatherState.windParticles.length > 0) {
            ctx.save();
            for (const wind of weatherState.windParticles) {
                ctx.strokeStyle = `rgba(200, 200, 200, ${wind.opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wind.x, wind.y + wind.yOffset);
                ctx.lineTo(wind.x - wind.length, wind.y + wind.yOffset);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw autumn leaf particles
        if (weatherState.leafParticles.length > 0) {
            ctx.save();
            for (const leaf of weatherState.leafParticles) {
                ctx.save();
                ctx.translate(leaf.x, leaf.y);
                ctx.rotate(leaf.rotation);
                ctx.fillStyle = leaf.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size * 0.4, leaf.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size * 0.7);
                ctx.lineTo(0, leaf.size * 0.7);
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        }

        // Draw ice crystals
        if (weatherState.iceCrystals.length > 0) {
            ctx.save();
            for (const crystal of weatherState.iceCrystals) {
                ctx.fillStyle = `rgba(200, 220, 255, ${crystal.opacity})`;
                ctx.translate(crystal.x, crystal.y);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-crystal.size / 2, -crystal.size / 2, crystal.size, crystal.size);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            ctx.restore();
        }

        // Draw transition particles
        this.drawTransitionParticles(ctx);
    }

    drawLightningBolts(ctx, bolts) {
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

    drawTransitionParticles(ctx) {
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