// Background and Ground Rendering
import { GROUND_HEIGHT, BASE_PIPE_SPEED as PIPE_SPEED } from '../config/constants.js';
import { DAY_THEMES, DAY_CYCLE } from '../config/constants.js';

// ============================================================
// DAY CYCLE MANAGER
// Handles theme transitions and interpolation
// ============================================================
export class DayCycleManager {
    constructor() {
        this.currentThemeIndex = 0; // Start with 'day'
        this.nextThemeIndex = 1;
        this.progress = 0; // 0 to 1 within current phase
        this.phaseStartTime = 0;
        this.elapsedFrames = 0;
        this.isTransitioning = false;
        
        // Current interpolated values (for rendering)
        this.currentSkyGradient = [...DAY_THEMES[0].skyGradient];
        this.currentCloudColor = DAY_THEMES[0].cloudColor;
        this.currentGroundBase = DAY_THEMES[0].groundBase;
        this.currentGroundTop = DAY_THEMES[0].groundTop;
        this.currentGroundPattern = DAY_THEMES[0].groundPattern;
        this.currentSunColor = DAY_THEMES[0].sunColor;
        this.currentMoonColor = DAY_THEMES[0].moonColor;
        this.currentAmbientLight = DAY_THEMES[0].ambientLight;
        this.currentStarOpacity = DAY_THEMES[0].starOpacity;
        
        // Stars for midnight/dawn
        this.stars = [];
        this.generateStars();
        
        this.initialized = false;
    }

    generateStars() {
        this.stars = [];
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random(), // Normalized position (0-1)
                y: Math.random() * 0.6, // Only in upper 60% of screen
                size: Math.random() * 2 + 0.5,
                twinkleSpeed: Math.random() * 0.1 + 0.05,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    init(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.generateStars();
        this.initialized = true;
    }

    reset() {
        this.currentThemeIndex = 0;
        this.nextThemeIndex = 1;
        this.progress = 0;
        this.elapsedFrames = 0;
        this.isTransitioning = false;
        this.applyTheme(DAY_THEMES[0]);
    }

    update(frameCount = 0) {
        if (!this.initialized) return;
        
        this.elapsedFrames++;
        
        // Get current phase duration
        const currentPhase = DAY_CYCLE.phases[this.currentThemeIndex];
        const phaseDuration = currentPhase.duration;
        
        // Update progress (0 to 1)
        this.progress = Math.min(this.elapsedFrames / phaseDuration, 1);
        
        // Check if phase is complete - transition to next theme
        if (this.progress >= 1) {
            this.transitionToNextTheme();
        }
    }

    transitionToNextTheme() {
        // Move to next phase
        this.currentThemeIndex = this.nextThemeIndex;
        this.nextThemeIndex = (this.nextThemeIndex + 1) % DAY_CYCLE.phases.length;
        
        // Reset progress for new phase
        this.elapsedFrames = 0;
        this.progress = 0;
    }

    getCurrentTheme() {
        return DAY_THEMES[this.currentThemeIndex];
    }

    getNextTheme() {
        return DAY_THEMES[this.nextThemeIndex];
    }

    // Interpolate between two hex colors
    interpolateColor(color1, color2, factor) {
        const hex = (color) => {
            if (color.startsWith('rgba')) {
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

    // Parse rgba string to components
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

    // Interpolate rgba colors
    interpolateRgba(color1, color2, factor) {
        const c1 = this.parseRgba(color1);
        const c2 = this.parseRgba(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = c1.a + (c2.a - c1.a) * factor;
        
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }

    // Smooth transition using easing
    easeTransition(t) {
        // Use smoothstep for smoother transitions
        return t * t * (3 - 2 * t);
    }

    // Get interpolated theme values based on progress
    getInterpolatedValues(time = 0) {
        const currentTheme = this.getCurrentTheme();
        const nextTheme = this.getNextTheme();
        
        // Use eased progress for smoother transitions
        let easedProgress;
        if (this.isTransitioning) {
            // During transition, use transition speed for gradual change
            easedProgress = this.progress;
        } else {
            // At phase end, smoothly blend to next
            easedProgress = this.easeTransition(this.progress);
        }
        
        // Interpolate sky gradient colors
        this.currentSkyGradient = [
            this.interpolateColor(currentTheme.skyGradient[0], nextTheme.skyGradient[0], easedProgress),
            this.interpolateColor(currentTheme.skyGradient[1], nextTheme.skyGradient[1], easedProgress)
        ];
        
        // Interpolate cloud color
        this.currentCloudColor = this.interpolateRgba(
            currentTheme.cloudColor, 
            nextTheme.cloudColor, 
            easedProgress
        );
        
        // Interpolate ground colors
        this.currentGroundBase = this.interpolateColor(
            currentTheme.groundBase, 
            nextTheme.groundBase, 
            easedProgress
        );
        this.currentGroundTop = this.interpolateColor(
            currentTheme.groundTop, 
            nextTheme.groundTop, 
            easedProgress
        );
        this.currentGroundPattern = this.interpolateColor(
            currentTheme.groundPattern, 
            nextTheme.groundPattern, 
            easedProgress
        );
        
        // Interpolate celestial colors
        this.currentSunColor = this.interpolateRgba(
            currentTheme.sunColor, 
            nextTheme.sunColor, 
            easedProgress
        );
        this.currentMoonColor = this.interpolateRgba(
            currentTheme.moonColor, 
            nextTheme.moonColor, 
            easedProgress
        );
        
        // Interpolate ambient light
        this.currentAmbientLight = currentTheme.ambientLight + 
            (nextTheme.ambientLight - currentTheme.ambientLight) * easedProgress;
        
        // Interpolate star opacity
        this.currentStarOpacity = currentTheme.starOpacity + 
            (nextTheme.starOpacity - currentTheme.starOpacity) * easedProgress;
    }

    // Get star visibility with twinkle effect
    getStarOpacity(star, time) {
        if (this.currentStarOpacity <= 0) return 0;
        
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        return this.currentStarOpacity * twinkle;
    }

    // Apply current theme values (for non-transition rendering)
    applyTheme(theme) {
        this.currentSkyGradient = [...theme.skyGradient];
        this.currentCloudColor = theme.cloudColor;
        this.currentGroundBase = theme.groundBase;
        this.currentGroundTop = theme.groundTop;
        this.currentGroundPattern = theme.groundPattern;
        this.currentSunColor = theme.sunColor;
        this.currentMoonColor = theme.moonColor;
        this.currentAmbientLight = theme.ambientLight;
        this.currentStarOpacity = theme.starOpacity;
    }

    // Get current theme name for debugging
    getThemeName() {
        return this.getCurrentTheme().name;
    }
}

// ============================================================
// PARALLAX CLOUDS (unchanged structure, updated colors)
// ============================================================
// Parallax layers - speed multiplier determines depth (lower = farther away)
const PARALLAX_LAYERS = [
    { speedMultiplier: 0.1, minSpacing: 300, yRange: [30, 120], scaleRange: [0.5, 0.8] },  // Far clouds (slowest)
    { speedMultiplier: 0.25, minSpacing: 250, yRange: [80, 180], scaleRange: [0.4, 0.7] },  // Mid clouds
    { speedMultiplier: 0.4, minSpacing: 200, yRange: [20, 100], scaleRange: [0.6, 1.0] }   // Near clouds (faster)
];

export class Cloud {
    constructor(x, y, scale, parallaxLayer) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.parallaxLayer = parallaxLayer;
        this.width = 90; // Base cloud width (3 arcs)
        this.height = 60; // Base cloud height
    }

    update(speed) {
        this.x -= speed * this.parallaxLayer.speedMultiplier;
        // Wrap around when fully off-screen
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
// STAR FIELD
// ============================================================
export class StarField {
    constructor() {
        this.stars = [];
        this.generateStars();
    }

    generateStars() {
        this.stars = [];
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random(), // Normalized position (0-1)
                y: Math.random() * 0.6, // Only in upper 60% of screen
                size: Math.random() * 2 + 0.5,
                twinkleSpeed: Math.random() * 0.1 + 0.05,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    draw(ctx, canvasWidth, canvasHeight, dayCycle, time) {
        if (dayCycle.currentStarOpacity <= 0) return;

        ctx.save();
        for (const star of this.stars) {
            const opacity = dayCycle.getStarOpacity(star, time);
            if (opacity <= 0) continue;

            const x = star.x * canvasWidth;
            const y = star.y * canvasHeight;
            
            ctx.fillStyle = `rgba(255, 255, 240, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// ============================================================
// CELESTIAL BODIES (Sun and Moon)
// ============================================================
export class CelestialBodies {
    constructor() {
        this.sunAngle = 0;
        this.moonAngle = Math.PI; // Opposite of sun
    }

    draw(ctx, canvasWidth, canvasHeight, dayCycle, time) {
        ctx.save();
        
        // Draw sun if visible
        const sunOpacity = this.parseRgba(dayCycle.currentSunColor).a;
        if (sunOpacity > 0) {
            // Sun arcs across the sky
            const sunX = canvasWidth * 0.5 + Math.cos(time * 0.0003) * canvasWidth * 0.3;
            const sunY = canvasHeight * 0.2 + Math.sin(time * 0.0003) * canvasHeight * 0.1;
            
            // Sun glow
            const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
            gradient.addColorStop(0, dayCycle.currentSunColor);
            gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun core
            ctx.fillStyle = dayCycle.currentSunColor;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw moon if visible
        const moonOpacity = this.parseRgba(dayCycle.currentMoonColor).a;
        if (moonOpacity > 0) {
            // Moon arcs opposite to sun
            const moonX = canvasWidth * 0.5 - Math.cos(time * 0.0003) * canvasWidth * 0.3;
            const moonY = canvasHeight * 0.15 + Math.sin(time * 0.0003 + Math.PI) * canvasHeight * 0.08;
            
            // Moon glow
            const gradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
            gradient.addColorStop(0, dayCycle.currentMoonColor);
            gradient.addColorStop(1, 'rgba(240, 240, 200, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon core (with crater effect)
            ctx.fillStyle = dayCycle.currentMoonColor;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon craters
            ctx.fillStyle = `rgba(180, 180, 160, ${moonOpacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(moonX - 4, moonY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(moonX + 5, moonY + 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
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
}

// ============================================================
// BACKGROUND CLASS (updated with day cycle support)
// ============================================================
export class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.clouds = [];
        this.initialized = false;
        
        // Day cycle components
        this.dayCycle = new DayCycleManager();
        this.starField = new StarField();
        this.celestialBodies = new CelestialBodies();
    }

    init() {
        if (this.initialized) return;
        
        this.dayCycle.init(this.canvas.width, this.canvas.height);
        
        // Initialize parallax layer references to canvas width
        PARALLAX_LAYERS.forEach(layer => {
            layer.canvasWidth = this.canvas.width;
        });

        // Create clouds for each parallax layer
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
        this.dayCycle.reset();
    }

    update(groundSpeed = PIPE_SPEED) {
        // Update day cycle
        this.dayCycle.update();
        
        // Get interpolated values for rendering
        this.dayCycle.getInterpolatedValues(Date.now());
        
        // Update all clouds with parallax scrolling
        this.clouds.forEach(cloud => {
            cloud.update(groundSpeed);
        });
    }

    draw(ctx) {
        this.drawSky(ctx);
        this.drawStars(ctx);
        this.drawCelestialBodies(ctx);
        this.drawClouds(ctx);
    }

    drawSky(ctx) {
        // Apply ambient light to sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height - GROUND_HEIGHT);
        skyGradient.addColorStop(0, this.dayCycle.currentSkyGradient[0]);
        skyGradient.addColorStop(1, this.dayCycle.currentSkyGradient[1]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - GROUND_HEIGHT);
    }

    drawStars(ctx) {
        this.starField.draw(ctx, this.canvas.width, this.canvas.height, this.dayCycle, Date.now());
    }

    drawCelestialBodies(ctx) {
        this.celestialBodies.draw(ctx, this.canvas.width, this.canvas.height, this.dayCycle, Date.now());
    }

    drawClouds(ctx) {
        // Draw clouds sorted by parallax layer (far first, near last) for proper depth ordering
        const sortedLayers = [...PARALLAX_LAYERS].sort((a, b) => a.speedMultiplier - b.speedMultiplier);
        
        for (const layer of sortedLayers) {
            const layerClouds = this.clouds.filter(c => c.parallaxLayer === layer);
            for (const cloud of layerClouds) {
                cloud.draw(ctx, this.dayCycle.currentCloudColor);
            }
        }
    }
}

// ============================================================
// GROUND CLASS (updated with day cycle support)
// ============================================================
export class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.offset = 0;
    }

    reset() {
        this.offset = 0;
    }

    update(groundSpeed = PIPE_SPEED) {
        this.offset = (this.offset + groundSpeed) % 24;
    }

    draw(ctx, dayCycle = null) {
        if (dayCycle) {
            this.drawGroundBase(ctx, dayCycle.currentGroundBase);
            this.drawGroundTop(ctx, dayCycle.currentGroundTop, dayCycle.currentGroundBase);
            this.drawGroundPattern(ctx, dayCycle.currentGroundPattern);
        } else {
            this.drawGroundBase(ctx);
            this.drawGroundTop(ctx);
            this.drawGroundPattern(ctx);
        }
    }

    drawGroundBase(ctx, color = '#d35400') {
        ctx.fillStyle = color;
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, GROUND_HEIGHT);
    }

    drawGroundTop(ctx, topColor = '#f39c12', baseColor = '#d35400') {
        const groundGradient = ctx.createLinearGradient(0, this.canvas.height - GROUND_HEIGHT, 0, this.canvas.height - GROUND_HEIGHT + 20);
        groundGradient.addColorStop(0, topColor);
        groundGradient.addColorStop(1, baseColor);
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, 20);
    }

    drawGroundPattern(ctx, color = '#e67e22') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let x = -this.offset; x < this.canvas.width; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, this.canvas.height - GROUND_HEIGHT + 20);
            ctx.lineTo(x + 12, this.canvas.height);
            ctx.stroke();
        }
    }
}