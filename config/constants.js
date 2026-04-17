// Game Constants
export const GRAVITY = 0.4;
export const JUMP_FORCE = -7;
export const PIPE_WIDTH = 60;
export const GROUND_HEIGHT = 80;

// Update loop constants - capped at 60 FPS to match frame-based design
export const UPDATE_INTERVAL = 1000 / 60; // ~16.67ms between updates

// --- Difficulty Scaling Configuration ---
// Base values (difficulty level 0)
export const BASE_PIPE_SPEED = 2.5;
export const MAX_PIPE_SPEED = 6;
export const PIPE_SPEED_INCREMENT = 0.3; // speed increase per difficulty level

export const BASE_PIPE_GAP = 150;
export const MIN_PIPE_GAP = 85;
export const GAP_REDUCTION_PER_LEVEL = 12; // gap reduction per difficulty level

export const BASE_SPAWN_INTERVAL = 100; // frames between pipe spawns
export const MIN_SPAWN_INTERVAL = 55; // minimum frames between spawns (max difficulty)
export const SPAWN_INTERVAL_REDUCTION_PER_LEVEL = 8; // reduction per difficulty level

// Difficulty thresholds (score at which difficulty increases)
export const DIFFICULTY_LEVEL_THRESHOLD = 5; // every 5 points, difficulty increases

// Pipe height variance (controls how much random variation in pipe heights)
export const PIPE_HEIGHT_VARIANCE = 40;

// Bird dimensions and position
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

// ============================================================
// DAY CYCLE THEME CONFIGURATION
// ============================================================
// Theme order: day -> evening -> midnight -> dawn -> day (loop)
// Each theme has specific colors for sky, clouds, ground, and lighting effects

export const DAY_THEMES = [
    {
        id: 'day',
        name: 'Day',
        skyGradient: ['#87CEEB', '#E0F7FA'],       // Bright blue sky
        cloudColor: 'rgba(255, 255, 255, 0.9)',    // White clouds
        groundBase: '#d35400',                       // Terracotta
        groundTop: '#f39c12',                        // Orange gradient top
        groundPattern: '#e67e22',                    // Pattern lines
        sunColor: 'rgba(255, 255, 100, 0.8)',       // Bright sun
        moonColor: 'rgba(200, 220, 255, 0)',        // Invisible moon
        ambientLight: 1.0,                           // Full brightness
        starOpacity: 0                               // No stars
    },
    {
        id: 'evening',
        name: 'Evening',
        skyGradient: ['#FF6B35', '#F7C59F'],       // Orange/pink sunset
        cloudColor: 'rgba(255, 150, 100, 0.7)',    // Warm tinted clouds
        groundBase: '#8B4513',                       // Dark brown
        groundTop: '#A0522D',                        // Sienna gradient top
        groundPattern: '#CD853F',                    // Peru pattern
        sunColor: 'rgba(255, 100, 50, 0.9)',       // Red setting sun
        moonColor: 'rgba(200, 220, 255, 0)',        // Fading moon
        ambientLight: 0.7,                           // Dimmer lighting
        starOpacity: 0.2                             // First stars appearing
    },
    {
        id: 'midnight',
        name: 'Midnight',
        skyGradient: ['#0C1445', '#1A1A3E'],       // Deep night blue
        cloudColor: 'rgba(100, 120, 180, 0.3)',    // Dark ghostly clouds
        groundBase: '#2C1810',                       // Very dark brown
        groundTop: '#3D2B1F',                        // Dark gradient top
        groundPattern: '#5C4033',                    // Dark pattern
        sunColor: 'rgba(255, 255, 100, 0)',        // No sun
        moonColor: 'rgba(240, 240, 200, 0.9)',     // Bright moon
        ambientLight: 0.4,                           // Low lighting
        starOpacity: 1.0                            // Full stars
    },
    {
        id: 'dawn',
        name: 'Dawn',
        skyGradient: ['#2C3E50', '#FD746C'],       // Purple/pink sunrise
        cloudColor: 'rgba(255, 180, 150, 0.5)',    // Soft pink clouds
        groundBase: '#5D4037',                       // Medium brown
        groundTop: '#795548',                        // Brown gradient top
        groundPattern: '#8D6E63',                    // Light pattern
        sunColor: 'rgba(255, 200, 100, 0.6)',      // Soft rising sun
        moonColor: 'rgba(200, 220, 255, 0.4)',     // Fading moon
        ambientLight: 0.6,                           // Dim lighting
        starOpacity: 0.3                            // Few stars remaining
    }
];

// Day cycle timing (in frames at 60fps)
// Total cycle: day(1800f=30s) -> evening(1800f=30s) -> midnight(2400f=40s) -> dawn(1800f=30s) -> repeat
export const DAY_CYCLE = {
    // Duration of each phase in frames (60fps)
    phases: [
        { themeIndex: 0, duration: 1800 },   // Day: 30 seconds
        { themeIndex: 1, duration: 1800 },   // Evening: 30 seconds
        { themeIndex: 2, duration: 2400 },   // Midnight: 40 seconds
        { themeIndex: 3, duration: 1800 }    // Dawn: 30 seconds
    ],
    totalDuration: 7800, // Total cycle duration in frames (130 seconds)
    transitionSpeed: 0.02 // Lerp factor for smooth transitions (0-1, lower = slower)
};