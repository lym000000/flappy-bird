// Weather Particle Generator & Updater
// Handles rain, snow, wind, leaf, ice crystal generation and physics
import { GROUND_HEIGHT } from '../config/constants.js';

export class WeatherParticles {
    constructor() {
        this.state = {
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
        this.currentWeatherConfig = null;
        this._frameCounter = 0;
        this._currentSeason = 'spring';
        this.canvasWidth = 400;
        this.canvasHeight = 600;
    }

    init() {
        this.state.raindrops = [];
        this.state.snowflakes = [];
        this.state.windParticles = [];
        this.state.leafParticles = [];
        this.state.iceCrystals = [];
        this.state.thunderFlash = 0;
        this.state.thunderTimer = 0;
        this.state.isThundering = false;
        this.state.lightningBolts = [];
    }

    update(frameCount, seasonId) {
        this._frameCounter = frameCount || 0;
        this._currentSeason = seasonId || 'spring';
        const weather = this.currentWeatherConfig;
        if (!weather) return;

        // Thunder logic
        this.state.thunderTimer++;
        if (this.state.thunderTimer >= weather.thunderInterval) {
            this.state.thunderTimer = 0;
            if (Math.random() < weather.secondaryChance.thunder || weather.primary === 'thunder') {
                this.state.isThundering = true;
                this.state.thunderFlash = 1.0;
                this._generateLightningBolt();
            }
        }

        if (this.state.thunderFlash > 0) {
            this.state.thunderFlash *= 0.85;
            if (this.state.thunderFlash < 0.01) {
                this.state.thunderFlash = 0;
                this.state.isThundering = false;
                this.state.lightningBolts = [];
            }
        }

        this.state.windStrength = weather.windStrength || 0.5;

        this._generateParticles(weather, frameCount);
        this._updateAllParticles();
    }

    setState(config) {
        this.currentWeatherConfig = config;
    }

    setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    getState() {
        return this.state;
    }

    _generateParticles(weather) {
        const w = this.canvasWidth || 400;
        const h = this.canvasHeight || 600;

        // Rain
        if (weather.primary === 'rain' || weather.secondaryChance?.rain > 0) {
            if ((this._frameCounter ||= 0) % 5 === 0 && Math.random() < (weather.secondaryChance?.rain || 0) * 0.3) {
                const count = Math.floor(weather.rainDensity * 3);
                for (let i = 0; i < count; i++) {
                    if (Math.random() < 0.25) {
                        this.state.raindrops.push({
                            x: w + Math.random() * 100 + (this.state.windStrength || 0.5) * 20,
                            y: -10,
                            length: 10 + Math.random() * 15,
                            speed: weather.rainSpeed * (0.8 + Math.random() * 0.4),
                            opacity: 0.3 + Math.random() * 0.4,
                            windOffset: this.state.windStrength * 3
                        });
                    }
                }
            }
        }

        // Snow
        if (weather.primary === 'snow') {
            const count = Math.floor(weather.rainDensity * 4);
            for (let i = 0; i < count; i++) {
                if (Math.random() < 0.2) {
                    this.state.snowflakes.push({
                        x: Math.random() * w,
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

        // Wind
        if (weather.primary === 'wind' || (weather.windStrength || 0) > 1.5) {
            const count = Math.floor((weather.windStrength || 0) * 2);
            for (let i = 0; i < count; i++) {
                if (Math.random() < 0.15) {
                    this.state.windParticles.push({
                        x: w + Math.random() * 50,
                        y: Math.random() * h * 0.7,
                        length: 30 + Math.random() * 60,
                        speed: 4 + (weather.windStrength || 0) * 2,
                        opacity: 0.1 + Math.random() * 0.15,
                        yOffset: Math.random() * 20 - 10
                    });
                }
            }
        }

        // Autumn leaves
        if (weather.primary === 'wind' && this._currentSeason === 'autumn') {
            if (Math.random() < 0.08) {
                const leafColors = ['#FF4500', '#FF6347', '#FF8C00', '#CD853F', '#8B4513'];
                this.state.leafParticles.push({
                    x: w + 20,
                    y: Math.random() * h * 0.4,
                    size: 4 + Math.random() * 5,
                    speed: 2 + (weather.windStrength || 0) * 1.5,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: 0.05 + Math.random() * 0.15,
                    color: leafColors[Math.floor(Math.random() * leafColors.length)],
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.03 + Math.random() * 0.04,
                    wobbleAmount: 1.5 + Math.random() * 1.5
                });
            }
        }

        // Ice crystals (winter)
        if (this._currentSeason === 'winter' && Math.random() < 0.05) {
            this.state.iceCrystals.push({
                x: Math.random() * w,
                y: -5,
                size: 1 + Math.random() * 2,
                speed: 0.5 + Math.random() * 1,
                drift: (Math.random() - 0.5) * 0.5,
                opacity: 0.3 + Math.random() * 0.3
            });
        }

        // Cap particle counts
        this._capArray(this.state.raindrops, 150);
        this._capArray(this.state.snowflakes, 200);
        this._capArray(this.state.windParticles, 40);
        this._capArray(this.state.leafParticles, 25);
        this._capArray(this.state.iceCrystals, 80);
    }

    _updateAllParticles() {
        const h = this.canvasHeight || 600;
        const w = this.canvasWidth || 400;
        const wind = this.state.windStrength || 0.5;

        // Update rain
        this.state.raindrops = this.state.raindrops.filter(r => {
            r.y += r.speed;
            r.x -= r.windOffset;
            return r.y < h && r.x > -50;
        });

        // Update snow
        this.state.snowflakes = this.state.snowflakes.filter(s => {
            s.wobble += s.wobbleSpeed;
            s.y += s.speed;
            s.x += Math.sin(s.wobble) * 1.5 + wind * 0.3;
            return s.y < h && s.x > -20 && s.x < w + 20;
        });

        // Update wind
        this.state.windParticles = this.state.windParticles.filter(wp => {
            wp.x -= wp.speed;
            return wp.x > -wp.length;
        });

        // Update leaves
        this.state.leafParticles = this.state.leafParticles.filter(l => {
            l.wobble += l.wobbleSpeed;
            l.x -= l.speed + Math.sin(l.wobble) * l.wobbleAmount;
            l.y += 0.5 + Math.random() * 0.5;
            l.rotation += l.rotationSpeed;
            return l.x > -30 && l.y < h;
        });

        // Update ice crystals
        this.state.iceCrystals = this.state.iceCrystals.filter(ic => {
            ic.y += ic.speed;
            ic.x += ic.drift + wind * 0.2;
            return ic.y < h;
        });
    }

    _generateLightningBolt() {
        const segments = [];
        let currentX = Math.random() * (this.canvasWidth || 400);
        let currentY = 0;
        const canvasHeight = (this.canvasHeight || 600) - GROUND_HEIGHT;

        while (currentY < canvasHeight) {
            const nextY = currentY + 20 + Math.random() * 40;
            const offsetX = (Math.random() - 0.5) * 60;
            segments.push({
                x1: currentX + (Math.random() - 0.5) * 30,
                y1: currentY,
                x2: currentX + offsetX,
                y2: nextY
            });
            currentX += offsetX;
            currentY = nextY;
        }

        this.state.lightningBolts = segments;
    }

    _capArray(arr, max) {
        if (arr.length > max) {
            arr.splice(0, arr.length - max);
        }
    }
}
