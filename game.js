// Main Game Controller
import { GROUND_HEIGHT } from './config/constants.js';
import { Bird } from './objects/bird.js';
import { Pet } from './objects/pet.js';
import { PipeManager } from './objects/pipe.js';
import { Background } from './scenes/background.js';
import { SeasonCycleManager } from './scenes/seasonManager.js';
import { Ground } from './scenes/ground.js';
import { InputHandler } from './game/input.js';
import { GameLoop } from './game/loops.js';
import { TextRenderer } from './game/textRenderer.js';
import { getParticleManager, createDeathParticles, createPipeCollisionParticles } from './objects/particles.js';

// Season display element
let seasonDisplay = null;

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// LocalStorage Keys
const STORAGE_KEYS = {
    BEST_SCORE: 'flappy_bird_best_score',
    TOTAL_COINS: 'flappy_bird_total_coins'
};

// LocalStorage Helpers
function getBestScore() {
    try {
        return parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE)) || 0;
    } catch (e) {
        return 0;
    }
}

function setBestScore(score) {
    try {
        const currentBest = getBestScore();
        if (score > currentBest) {
            localStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
        }
    } catch (e) {
        // LocalStorage not available
    }
}

function getTotalCoins() {
    try {
        return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_COINS)) || 0;
    } catch (e) {
        return 0;
    }
}

function addTotalCoins(amount) {
    try {
        const current = getTotalCoins();
        localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, (current + amount).toString());
    } catch (e) {
        // LocalStorage not available
    }
}

// Game State
let gameState = 'start'; // start, playing, gameover

// Initialize game components
const particleManager = getParticleManager();
const bird = new Bird(canvas);
const pet = new Pet();
const pipeManager = new PipeManager(canvas);
const seasonCycle = new SeasonCycleManager();
const background = new Background(canvas);
const ground = new Ground(canvas);

// Score
let score = 0;
let coinsCollected = 0;
let bestScore = 0;
let totalCoins = 0;

// Season display timer
let seasonDisplayTimer = 0;
let lastSeasonName = '';

// Handle player input (jump/start)
function handleInput() {
    if (gameState === 'start') {
        startGame();
    } else if (gameState === 'playing') {
        bird.jump();
    } else if (gameState === 'gameover') {
        // Restart game
        gameState = 'playing';
        score = 0;
        coinsCollected = 0;
        bestScore = getBestScore();
        totalCoins = getTotalCoins();
        bird.reset();
        pet.reset();
        pipeManager.reset();
        ground.reset();
        seasonCycle.init(canvas.width, canvas.height);
        background.init();
        gameLoop.resetFrameCount();
    }
}

// Input Handler
const inputHandler = new InputHandler(canvas, handleInput);

// Set up coin collection callback so coins are spawned
pipeManager.setOnCoinCollect(() => {});

// Render function
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context before applying screen shake
    ctx.save();

    // Apply screen shake offset (and restore will undo it)
    const shakeOffset = particleManager.getScreenShakeOffset();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // Always update season cycle and background for continuous animation
    // This ensures the background keeps animating during main menu and game over
    seasonCycle.update();
    if (background.initialized) {
        background.update(0.3); // Slow atmospheric drift
    }

    // Draw background (with season cycle for sky, clouds, weather)
    background.draw(ctx, seasonCycle);

    // Draw game elements
    pipeManager.draw(ctx);
    ground.draw(ctx, seasonCycle);

    // Draw bird (or bobbing animation on start screen)
    if (gameState === 'start') {
        bird.drawBobbing(ctx, performance.now());
        // Draw pet companion on start screen
        pet.draw(ctx, bird.x, bird.y);
        // Draw start screen text on canvas
        TextRenderer.drawStartScreen(ctx, canvas.width, canvas.height);
    } else if (gameState === 'playing') {
        // Draw main bird during gameplay
        bird.draw(ctx);
        // Draw pet companion following the bird
        pet.draw(ctx, bird.x, bird.y);
        
        // Draw score at top center (canvas-based)
        TextRenderer.drawScore(ctx, score);
        
        // Draw best score in top-right corner (canvas-based)
        TextRenderer.drawBestScore(ctx, bestScore);
        
        // Draw season indicator
        drawSeasonIndicator();
        
        // Draw difficulty indicator during gameplay
        drawDifficultyIndicator();
        
        // Draw coin counter during gameplay
        drawCoinCounter();
    } else if (gameState === 'gameover') {
        // Main bird disappears after death, but pet companion flies freely
        // Draw pet companion flying away
        pet.drawFlyingAway(ctx);
        
        // Draw score at top center (canvas-based)
        TextRenderer.drawScore(ctx, score);
        
        // Draw best score in top-right corner (canvas-based)
        TextRenderer.drawBestScore(ctx, bestScore);
        
        // Draw difficulty indicator during game over
        drawDifficultyIndicator();
        
        // Draw coin counter during game over
        drawCoinCounter();
    }

    // Draw game over screen on canvas
    if (gameState === 'gameover') {
        TextRenderer.drawGameOverScreen(
            ctx,
            canvas.width,
            canvas.height,
            score,
            coinsCollected,
            bestScore,
            totalCoins,
            pipeManager.getDifficultyLevel(score)
        );
    }

    // Restore context to remove screen shake offset
    ctx.restore();

    // Draw particle effects on top (without shake)
    particleManager.draw(ctx);
}

// Draw coin counter HUD (canvas-based) - moved to bottom left
function drawCoinCounter() {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    // Position at bottom left
    const pillHeight = 35;
    const coinText = coinsCollected + ' / ' + totalCoins;
    // Calculate width needed for text
    ctx.save();
    ctx.font = 'bold 16px Arial';
    const textWidth = ctx.measureText(coinText).width;
    ctx.restore();
    const pillWidth = Math.max(130, textWidth + 50);
    const x = 15;
    const y = canvasHeight - pillHeight - 15;
    
    // Semi-transparent background for coin counter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y, pillWidth, pillHeight);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, pillWidth, pillHeight);
    
    // Coin icon (small circle)
    const iconX = x + 25;
    const iconY = y + pillHeight / 2;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(iconX, iconY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Dollar sign on coin icon
    ctx.fillStyle = '#B8860B';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', iconX, iconY);
    
    // Coin count text (coins collected / total coins)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(coinText, x + 42, y + pillHeight / 2);
}

// Game Loop
const gameLoop = new GameLoop(
    // onUpdate callback
    (frameCount) => {
        if (gameState === 'playing') {
            // Update season cycle (time-based transitions)
            seasonCycle.update();

            // Update difficulty level based on score (every 5 scores)
            const currentDifficultyLevel = pipeManager.getDifficultyLevel(score);
            if (currentDifficultyLevel !== pipeManager.difficultyLevel) {
                pipeManager.difficultyLevel = currentDifficultyLevel;
            }
            
            // Only spawn pipes if frame matches the current spawn interval
            const currentSpawnInterval = pipeManager.getCurrentSpawnInterval();
            if (frameCount % currentSpawnInterval === 0) {
                const minHeight = 50;
                const maxHeight = canvas.height - GROUND_HEIGHT - pipeManager.getCurrentPipeGap() - minHeight;
                pipeManager.create(minHeight, maxHeight);
            }

            // Update bird
            const hitGround = bird.update();
            
            // Check ground collision - hitting the ground means game over
            if (hitGround) {
                // Create death particles at bird center
                const deathParticles = createDeathParticles(
                    bird.x + bird.width / 2,
                    bird.y + bird.height / 2
                );
                particleManager.addParticles(deathParticles);
                
                // Trigger screen shake
                particleManager.triggerScreenShake(15);
                
                setGameOver();
            }
            
            // Update pet to follow the bird
            pet.update(bird);
            
            // Update pipes (with coin collection callback)
            // pipe.js update signature: update(bird, onScore, onCollision, onCoinCollect)
            pipeManager.update(bird,
                // onScore - called when bird passes pipe
                () => {
                    score++;
                },
                // onCollision - called when bird hits pipe (triggers death)
                () => {
                    // Create death particles at bird center
                    const deathParticles = createDeathParticles(
                        bird.x + bird.width / 2,
                        bird.y + bird.height / 2
                    );
                    particleManager.addParticles(deathParticles);
                    
                    // Trigger screen shake
                    particleManager.triggerScreenShake(15);
                    
                    setGameOver();
                },
                // onCoinCollect - called when bird collects coin
                () => {
                    coinsCollected++;
                }
            );

            // Get current speed for ground/background scrolling
            const currentSpeed = pipeManager.getCurrentPipeSpeed();
            
            // Update ground with pipe speed for scrolling effect
            ground.update(currentSpeed);

            // Update background with parallax scrolling
            background.update(currentSpeed);

        } else if (gameState === 'start') {
            // Bobbing animation handled in render
        }

        // Update particle effects every frame (including game over state)
        // This ensures death particles continue animating during game over
        particleManager.update();
    },
    render
);

// Start the game loops
gameLoop.startUpdateLoop();
gameLoop.startRenderLoop(render);

// Draw difficulty indicator on canvas - bottom right
function drawDifficultyIndicator() {
    const difficultyInfo = pipeManager.getDifficultyInfo();
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const pillWidth = 140;
    const pillHeight = 60;
    const x = canvasWidth - pillWidth - 15;
    const coinY = canvasHeight - 35 - 15;
    const y = coinY - 10;
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y, pillWidth, pillHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, pillWidth, pillHeight);
    
    // Season name with weather icon
    const seasonName = seasonCycle.getSeasonName();
    const weatherType = seasonCycle.getCurrentWeatherType();
    const seasonColors = {
        'Spring': '#4CAF50',
        'Summer': '#FF9800',
        'Autumn': '#FF5722',
        'Winter': '#2196F3'
    };
    
    ctx.fillStyle = seasonColors[seasonName] || '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    const weatherIcons = { rain: '🌧️', snow: '❄️', thunder: '⚡', wind: '💨', clear: '☀️' };
    ctx.fillText(seasonName + ' ' + (weatherIcons[weatherType] || ''), x + 8, y + 16);
    
    // Difficulty level
    ctx.fillStyle = getDifficultyColor(difficultyInfo.level);
    ctx.font = 'bold 12px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('LEVEL ' + difficultyInfo.level, x + 8, y + 32);
    
    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('Speed: ' + difficultyInfo.pipeSpeed.toFixed(1), x + 8, y + 48);
}

// Draw season indicator - top left corner
function drawSeasonIndicator() {
    const seasonName = seasonCycle.getSeasonName();
    const weatherType = seasonCycle.getCurrentWeatherType();
    const dayNightPhase = seasonCycle.getDayNightPhaseName();
    
    const pillHeight = 28;
    const text = seasonName + ' ' + dayNightPhase;
    ctx.save();
    ctx.font = 'bold 13px Arial';
    const textWidth = ctx.measureText(text).width;
    ctx.restore();
    const pillWidth = textWidth + 20;
    const x = 15;
    const y = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, pillWidth, pillHeight);
    
    const seasonColors = {
        'Spring': '#4CAF50',
        'Summer': '#FF9800',
        'Autumn': '#FF5722',
        'Winter': '#2196F3'
    };
    
    ctx.fillStyle = seasonColors[seasonName] || '#ffffff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, x + 10, y + pillHeight / 2);
}

// Get color based on difficulty level
function getDifficultyColor(level) {
    if (level === 1) return '#2ecc71'; // Green - Easy
    if (level <= 3) return '#f1c40f'; // Yellow - Medium
    if (level <= 5) return '#e67e22'; // Orange - Hard
    return '#e74c3c'; // Red - Extreme
}

// Update difficulty display element (if using HTML overlay)
function updateDifficultyDisplay(difficultyInfo) {
    // The difficulty is drawn on canvas via drawDifficultyIndicator()
    // This function can be extended for HTML-based UI updates if needed
    console.log(`Difficulty increased to Level ${difficultyInfo.level}!`);
}

// Start game
function startGame() {
    // Reset particle effects
    particleManager.reset();
    gameState = 'playing';
    score = 0;
    coinsCollected = 0;
    bestScore = getBestScore();
    totalCoins = getTotalCoins();
    
    bird.reset();
    pet.reset();
    pipeManager.reset();
    ground.reset();
    seasonCycle.init(canvas.width, canvas.height);
    background.init();
    gameLoop.resetFrameCount();
}

// Set game over
function setGameOver() {
    gameState = 'gameover';
    
    // Save best score and coins to LocalStorage
    setBestScore(score);
    addTotalCoins(coinsCollected);
    
    bestScore = getBestScore();
    totalCoins = getTotalCoins();
}