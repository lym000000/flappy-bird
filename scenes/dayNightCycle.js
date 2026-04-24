// Day-Night Cycle Manager
// Handles day/night phases, sun/moon/stars, and color interpolation
import { DAY_CYCLE, DAY_THEMES } from '../config/constants.js';

export class DayNightCycle {
    constructor() {
        this.dayThemeProgress = 0;
        this.currentDayTheme = DAY_THEMES[0];
        this.nextDayTheme = DAY_THEMES[1];
        this.dayThemeIndex = 0;
        this.dayNightTransitionAlpha = 0;

        // Interpolated rendering values
        this._state = {
            skyGradient: [...DAY_THEMES[0].skyGradient],
            cloudColor: DAY_THEMES[0].cloudColor,
            groundBase: DAY_THEMES[0].groundBase,
            groundTop: DAY_THEMES[0].groundTop,
            groundPattern: DAY_THEMES[0].groundPattern,
            ambientLight: DAY_THEMES[0].ambientLight,
            starOpacity: 0,
            moonColor: 'rgba(200, 220, 255, 0)',
            sunColor: 'rgba(255, 255, 100, 0)'
        };
    }

    update(frameCount = 0) {
        const totalDayDuration = DAY_CYCLE.totalDuration;
        this.dayThemeProgress = (this.dayThemeProgress + 1) % totalDayDuration;

        // Find current and next phase/theme
        let accumulatedDuration = 0;
        let currentThemeIndex = 0;
        let nextThemeIndex = 0;
        let phaseProgress = 0;
        let phaseDuration = 0;

        for (let i = 0; i < DAY_CYCLE.phases.length; i++) {
            const phase = DAY_CYCLE.phases[i];
            const nextPhase = DAY_CYCLE.phases[(i + 1) % DAY_CYCLE.phases.length];

            if (this.dayThemeProgress >= accumulatedDuration && this.dayThemeProgress < accumulatedDuration + phase.duration) {
                currentThemeIndex = phase.themeIndex;
                nextThemeIndex = nextPhase.themeIndex;
                phaseProgress = this.dayThemeProgress - accumulatedDuration;
                phaseDuration = phase.duration;
                break;
            }
            accumulatedDuration += phase.duration;
        }

        // Transition alpha (smooth transition in last 15% of phase)
        const transitionPoint = phaseDuration * 0.85;
        if (phaseProgress > transitionPoint) {
            this.dayNightTransitionAlpha = (phaseProgress - transitionPoint) / (phaseDuration - transitionPoint);
            this.currentDayTheme = DAY_THEMES[currentThemeIndex];
            this.nextDayTheme = DAY_THEMES[nextThemeIndex];
        } else {
            this.dayNightTransitionAlpha = 0;
            this.currentDayTheme = DAY_THEMES[currentThemeIndex];
            this.nextDayTheme = DAY_THEMES[currentThemeIndex];
        }

        // Interpolate values
        const alpha = this.dayNightTransitionAlpha;
        const current = this.currentDayTheme;
        const next = this.nextDayTheme;

        this._state.skyGradient = [
            this._interpolateColor(current.skyGradient[0], next.skyGradient[0], alpha),
            this._interpolateColor(current.skyGradient[1], next.skyGradient[1], alpha)
        ];
        this._state.cloudColor = this._interpolateRgba(current.cloudColor, next.cloudColor, alpha);
        this._state.groundBase = this._interpolateColor(current.groundBase, next.groundBase, alpha);
        this._state.groundTop = this._interpolateColor(current.groundTop, next.groundTop, alpha);
        this._state.groundPattern = this._interpolateColor(current.groundPattern, next.groundPattern, alpha);
        this._state.ambientLight = current.ambientLight + (next.ambientLight - current.ambientLight) * alpha;
        this._state.starOpacity = current.starOpacity + (next.starOpacity - current.starOpacity) * alpha;
        this._state.moonColor = this._interpolateRgba(current.moonColor, next.moonColor, alpha);
        this._state.sunColor = this._interpolateRgba(current.sunColor, next.sunColor, alpha);
    }

    getState() {
        return this._state;
    }

    getPhase() {
        // Overall phase 0-1 for celestial positioning
        let accumulatedDuration = 0;
        for (let i = 0; i < DAY_CYCLE.phases.length; i++) {
            const phase = DAY_CYCLE.phases[i];
            if (this.dayThemeProgress >= accumulatedDuration && this.dayThemeProgress < accumulatedDuration + phase.duration) {
                return (accumulatedDuration + (this.dayThemeProgress - accumulatedDuration)) / DAY_CYCLE.totalDuration;
            }
            accumulatedDuration += phase.duration;
        }
        return 0;
    }

    getPhaseName() {
        let accumulatedDuration = 0;
        for (let i = 0; i < DAY_CYCLE.phases.length; i++) {
            const phase = DAY_CYCLE.phases[i];
            if (this.dayThemeProgress >= accumulatedDuration && this.dayThemeProgress < accumulatedDuration + phase.duration) {
                return DAY_THEMES[phase.themeIndex].name;
            }
            accumulatedDuration += phase.duration;
        }
        return 'Unknown';
    }

    _interpolateColor(color1, color2, factor) {
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

    _parseRgba(colorStr) {
        const match = colorStr.match(/[\d.]+/g);
        if (!match) return { r: 0, g: 0, b: 0, a: 0 };
        return {
            r: parseFloat(match[0]),
            g: parseFloat(match[1]),
            b: parseFloat(match[2]),
            a: parseFloat(match[3])
        };
    }

    _interpolateRgba(color1, color2, factor) {
        const c1 = this._parseRgba(color1);
        const c2 = this._parseRgba(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = c1.a + (c2.a - c1.a) * factor;

        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }
}
