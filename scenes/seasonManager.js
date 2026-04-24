// Season Manager - Main Orchestrator
// Initializes and coordinates all season-related sub-managers:
//   - Season cycling (progress, transitions, interpolation) → seasonCycle.js
//   - Day-night cycle (phases, themes, sun/moon/stars) → dayNightCycle.js
//   - Weather particles (rain/snow/wind/leaf/ice generation + update) → weatherParticles.js
//   - Weather rendering (draw rain/snow/lightning/transitions → weatherRenderer.js
//   - Transition particles (season change effects → transitionParticles.js

import { SEASONS, WEATHER_TYPES } from '../config/constants.js';
import { SeasonCycleManager } from './seasonCycle.js';
import { DayNightCycle } from './dayNightCycle.js';
import { WeatherParticles } from './weatherParticles.js';
import { WeatherRenderer } from './weatherRenderer.js';
import { TransitionParticles } from './transitionParticles.js';

// ============================================================
// SEASON MANAGER - Main entry point for all season systems
// ============================================================
export class SeasonManager {
    constructor() {
        // Initialize all sub-managers
        this.seasonCycle = new SeasonCycleManager();
        this.dayNightCycle = new DayNightCycle();
        this.weatherParticles = new WeatherParticles();
        this.weatherRenderer = new WeatherRenderer();
        this.transitionParticles = new TransitionParticles();

        this.initialized = false;
    }

    init(canvasWidth, canvasHeight) {
        // Initialize all sub-managers with shared context
        this.seasonCycle.init(
            canvasWidth,
            canvasHeight,
            this.dayNightCycle,
            this.weatherParticles,
            this.weatherRenderer,
            this.transitionParticles
        );

        this.initialized = true;
    }

    reset() {
        this.seasonCycle.reset();
    }

    update(frameCount) {
        if (!this.initialized) return;
        this.seasonCycle.update(frameCount);
    }

    drawWeather(ctx) {
        if (!this.initialized) return;
        this.seasonCycle.drawWeather(ctx);
    }

    // Delegate methods to seasonCycle
    getSeasonName() {
        return this.seasonCycle ? this.seasonCycle.getSeasonName() : 'Unknown';
    }

    getCurrentWeatherType() {
        return this.seasonCycle ? this.seasonCycle.getCurrentWeatherType() : 'clear';
    }

    getDayNightPhaseName() {
        return this.dayNightCycle ? this.dayNightCycle.getPhaseName() : 'Unknown';
    }

    getDayNightState() {
        return this.seasonCycle ? this.seasonCycle.getDayNightState() : null;
    }

    getDayNightPhase() {
        return this.seasonCycle ? this.seasonCycle.getDayNightPhase() : 0;
    }

    getWeatherState() {
        return this.seasonCycle ? this.seasonCycle.getWeatherState() : null;
    }

    // Expose cloud color for background rendering
    get currentCloudColor() {
        return this.seasonCycle ? this.seasonCycle.currentCloudColor : 'rgba(255, 255, 255, 0.8)';
    }
}