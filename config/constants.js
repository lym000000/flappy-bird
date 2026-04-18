// Game Constants
export const GRAVITY = 0.4;
export const JUMP_FORCE = -7;
export const PIPE_WIDTH = 60;
export const GROUND_HEIGHT = 80;

// Update loop constants - capped at 60 FPS to match frame-based design
export const UPDATE_INTERVAL = 1000 / 60; // ~16.67ms between updates

// ============================================================
// 4 SEASONS CONFIGURATION
// Each season has unique visual themes, weather patterns, and environmental effects
// Seasons cycle: Spring -> Summer -> Autumn -> Winter -> Spring (continuous loop)
// ============================================================

export const SEASONS = [
    {
        id: 'spring',
        name: 'Spring',
        duration: 18000, // frames (5 minutes at 60fps)
        // Sky colors - bright, fresh spring sky
        skyGradient: ['#87CEEB', '#B0E0E6'],
        cloudColor: 'rgba(255, 255, 255, 0.85)',
        cloudDensity: 0.6,
        // Ground colors - fresh green with earth tones
        groundBase: '#5D8238',
        groundTop: '#6B8E23',
        groundPattern: '#4A6B20',
        // Vegetation/decoration colors
        foliageColor: '#4CAF50',
        flowerColors: ['#FF69B4', '#FFB6C1', '#FF1493', '#FFA07A'],
        // Lighting
        ambientLight: 1.0,
        // Weather system - spring has light rain and occasional thunder
        weatherSystem: 'springWeather',
        // Background elements
        bgElements: 'cherryBlossoms'
    },
    {
        id: 'summer',
        name: 'Summer',
        duration: 18000,
        // Bright, hot summer sky
        skyGradient: ['#1E90FF', '#87CEEB'],
        cloudColor: 'rgba(255, 255, 255, 0.6)',
        cloudDensity: 0.3,
        // Dry, warm ground
        groundBase: '#DAA520',
        groundTop: '#F4A460',
        groundPattern: '#CD853F',
        // Hot foliage
        foliageColor: '#2E7D32',
        flowerColors: ['#FF6347', '#FF4500'],
        // Bright, intense lighting
        ambientLight: 1.1,
        // Weather system - summer has heat haze and thunderstorms
        weatherSystem: 'summerWeather',
        // Background elements
        bgElements: 'sunflowers'
    },
    {
        id: 'autumn',
        name: 'Autumn',
        duration: 18000,
        // Overcast, golden autumn sky
        skyGradient: ['#B8860B', '#D2B48C'],
        cloudColor: 'rgba(180, 160, 140, 0.7)',
        cloudDensity: 0.8,
        // Warm, earthy ground
        groundBase: '#8B4513',
        groundTop: '#A0522D',
        groundPattern: '#CD853F',
        // Autumn foliage colors
        foliageColor: '#FF4500',
        flowerColors: ['#FF8C00', '#FF6347'],
        // Warm, golden lighting
        ambientLight: 0.85,
        // Weather system - autumn has strong wind and falling leaves
        weatherSystem: 'autumnWeather',
        // Background elements
        bgElements: 'fallingLeaves'
    },
    {
        id: 'winter',
        name: 'Winter',
        duration: 18000,
        // Cold, gray winter sky
        skyGradient: ['#778899', '#B0C4DE'],
        cloudColor: 'rgba(220, 220, 230, 0.8)',
        cloudDensity: 0.9,
        // Snowy ground
        groundBase: '#2C3E50',
        groundTop: '#ECF0F1',
        groundPattern: '#BDC3C7',
        // Cold foliage
        foliageColor: '#1B4F3B',
        flowerColors: ['#E8E8E8', '#D4E6F1'],
        // Cold, dim lighting
        ambientLight: 0.6,
        // Weather system - winter has heavy snow
        weatherSystem: 'winterWeather',
        // Background elements
        bgElements: 'iceCrystals'
    }
];

// Weather type definitions for each season
export const WEATHER_TYPES = {
    // Spring: Light rain showers
    springWeather: {
        primary: 'rain',
        intensity: 0.3,
        secondaryChance: { thunder: 0.15, wind: 0.1 },
        rainColor: 'rgba(174, 194, 224, 0.6)',
        rainSpeed: 6,
        rainDensity: 0.4,
        thunderFlashColor: 'rgba(200, 200, 255, 0.8)',
        thunderInterval: 600, // frames between possible thunder
        windStrength: 0.5
    },
    // Summer: Clear with occasional thunderstorms
    summerWeather: {
        primary: 'thunder',
        intensity: 0.4,
        secondaryChance: { rain: 0.3, wind: 0.2 },
        rainColor: 'rgba(100, 100, 150, 0.5)',
        rainSpeed: 8,
        rainDensity: 0.6,
        thunderFlashColor: 'rgba(255, 255, 255, 1.0)',
        thunderInterval: 300,
        windStrength: 1.0
    },
    // Autumn: Strong wind with falling leaves
    autumnWeather: {
        primary: 'wind',
        intensity: 0.7,
        secondaryChance: { rain: 0.15, thunder: 0.05 },
        rainColor: 'rgba(150, 150, 170, 0.3)',
        rainSpeed: 4,
        rainDensity: 0.2,
        thunderFlashColor: 'rgba(200, 200, 255, 0.5)',
        thunderInterval: 900,
        windStrength: 2.5
    },
    // Winter: Heavy snowfall
    winterWeather: {
        primary: 'snow',
        intensity: 0.8,
        secondaryChance: { wind: 0.2, thunder: 0.02 }, // sleet/thunder
        rainColor: 'rgba(255, 255, 255, 0.7)',
        rainSpeed: 1.5,
        rainDensity: 0.9,
        thunderFlashColor: 'rgba(220, 230, 255, 0.6)',
        thunderInterval: 1200,
        windStrength: 0.8
    }
};

// ============================================================
// DAY CYCLE THEME CONFIGURATION (within each season)
// ============================================================

export const DAY_THEMES = [
    {
        id: 'day',
        name: 'Day',
        skyGradient: ['#87CEEB', '#E0F7FA'],
        cloudColor: 'rgba(255, 255, 255, 0.9)',
        groundBase: '#d35400',
        groundTop: '#f39c12',
        groundPattern: '#e67e22',
        sunColor: 'rgba(255, 255, 100, 0.8)',
        moonColor: 'rgba(200, 220, 255, 0)',
        ambientLight: 1.0,
        starOpacity: 0
    },
    {
        id: 'evening',
        name: 'Evening',
        skyGradient: ['#FF6B35', '#F7C59F'],
        cloudColor: 'rgba(255, 150, 100, 0.7)',
        groundBase: '#8B4513',
        groundTop: '#A0522D',
        groundPattern: '#CD853F',
        sunColor: 'rgba(255, 100, 50, 0.9)',
        moonColor: 'rgba(200, 220, 255, 0)',
        ambientLight: 0.7,
        starOpacity: 0.2
    },
    {
        id: 'midnight',
        name: 'Midnight',
        skyGradient: ['#0C1445', '#1A1A3E'],
        cloudColor: 'rgba(100, 120, 180, 0.3)',
        groundBase: '#2C1810',
        groundTop: '#3D2B1F',
        groundPattern: '#5C4033',
        sunColor: 'rgba(255, 255, 100, 0)',
        moonColor: 'rgba(240, 240, 200, 0.9)',
        ambientLight: 0.4,
        starOpacity: 1.0
    },
    {
        id: 'dawn',
        name: 'Dawn',
        skyGradient: ['#2C3E50', '#FD746C'],
        cloudColor: 'rgba(255, 180, 150, 0.5)',
        groundBase: '#5D4037',
        groundTop: '#795548',
        groundPattern: '#8D6E63',
        sunColor: 'rgba(255, 200, 100, 0.6)',
        moonColor: 'rgba(200, 220, 255, 0.4)',
        ambientLight: 0.6,
        starOpacity: 0.3
    }
];

// Day cycle timing
export const DAY_CYCLE = {
    phases: [
        { themeIndex: 0, duration: 1800 },
        { themeIndex: 1, duration: 1800 },
        { themeIndex: 2, duration: 2400 },
        { themeIndex: 3, duration: 1800 }
    ],
    totalDuration: 7800,
    transitionSpeed: 0.02
};

// Difficulty scaling constants
export const BASE_PIPE_SPEED = 2.5;
export const MAX_PIPE_SPEED = 6;
export const PIPE_SPEED_INCREMENT = 0.3;

export const BASE_PIPE_GAP = 150;
export const MIN_PIPE_GAP = 85;
export const GAP_REDUCTION_PER_LEVEL = 12;

export const BASE_SPAWN_INTERVAL = 100;
export const MIN_SPAWN_INTERVAL = 55;
export const SPAWN_INTERVAL_REDUCTION_PER_LEVEL = 8;

export const DIFFICULTY_LEVEL_THRESHOLD = 5;
export const PIPE_HEIGHT_VARIANCE = 40;

// Bird configuration
export const BIRD_CONFIG = {
    startX: 80,
    startY: 250,
    width: 34,
    height: 26
};

// Bobbing animation config
export const BOBBING_CONFIG = {
    baseY: 250,
    amplitude: 10,
    frequency: 300
};

// Pet companion configuration
export const PET_CONFIG = {
    width: 30,
    height: 24,
    defaultOffsetX: -30,
    defaultOffsetY: 10,
    orbitRadius: 45,
    maxDistance: 70,
    minDistance: 25
};