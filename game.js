// Main Game Controller
import { GROUND_HEIGHT } from './config/constants.js';
import { Bird } from './objects/bird.js';
import { PipeManager } from './objects/pipe.js';
import { Background, Ground } from './scenes/background.js';
import { InputHandler } from './game/input.js';
import { GameLoop } from './game/loops.js';
import { TextRenderer } from './game/textRenderer.js';

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
const bird = new Bird(canvas);
const pipeManager = new PipeManager(canvas);
const background = new Background(canvas);
const ground = new Ground(canvas);

// Score
let score = 0;
let coinsCollected = 0;
let bestScore = 0;
let totalCoins = 0;

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
        pipeManager.reset();
        ground.reset();
        background.init();
        gameLoop.resetFrameCount();
    }
}

// Input Handler
const inputHandler = new InputHandler(canvas, handleInput);

// Render function
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    background.draw(ctx);

    // Draw game elements
    pipeManager.draw(ctx);
    ground.draw(ctx, background.dayCycle);

    // Draw bird (or bobbing animation on start screen)
    if (gameState === 'start') {
        bird.drawBobbing(ctx, performance.now());
        // Draw start screen text on canvas
        TextRenderer.drawStartScreen(ctx, canvas.width, canvas.height);
    } else {
        bird.draw(ctx);
        
        // Draw score at top center (canvas-based)
        TextRenderer.drawScore(ctx, score);
        
        // Draw best score in top-right corner (canvas-based)
        if (gameState === 'playing' || gameState === 'gameover') {
            TextRenderer.drawBestScore(ctx, bestScore);
        }
        
        // Draw difficulty indicator during gameplay
        drawDifficultyIndicator();
        
        // Draw coin counter during gameplay
        if (gameState === 'playing') {
            drawCoinCounter();
        }
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
}

// Draw coin counter HUD (canvas-based)
function drawCoinCounter() {
    const totalDisplay = coinsCollected;
    
    // Semi-transparent background for coin counter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(10, 10, 120, 35);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 120, 35);
    
    // Coin icon (small circle)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(28, 27, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Dollar sign on coin icon
    ctx.fillStyle = '#B8860B';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 28, 27);
    
    // Coin count text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(totalDisplay.toString(), 45, 27);
}

// Game Loop
const gameLoop = new GameLoop(
    // onUpdate callback
    (frameCount) => {
        if (gameState === 'playing') {
            // Update difficulty level based on score
            const currentDifficultyLevel = pipeManager.getDifficultyLevel(score);
            
            // Only spawn pipes if frame matches the current spawn interval
            const currentSpawnInterval = pipeManager.getCurrentSpawnInterval();
            if (frameCount % currentSpawnInterval === 0) {
                const minHeight = 50;
                const maxHeight = canvas.height - GROUND_HEIGHT - pipeManager.getCurrentPipeGap() - minHeight;
                pipeManager.create(minHeight, maxHeight);
            }

            // Update bird
            const hitGround = bird.update();
            if (hitGround) {
                setGameOver();
            }

            // Update pipes (with coin collection callback)
            pipeManager.update(bird, () => {
                score++;
                
                // Update difficulty display when level changes
                if (pipeManager.getDifficultyLevel(score) !== currentDifficultyLevel) {
                    pipeManager.difficultyLevel = pipeManager.getDifficultyLevel(score);
                    updateDifficultyDisplay(pipeManager.getDifficultyInfo());
                }
            }, () => setGameOver(), () => {
                // Coin collected callback
                coinsCollected++;
            });

            // Get current speed for ground/background scrolling
            const currentSpeed = pipeManager.getCurrentPipeSpeed();
            
            // Update ground with pipe speed for scrolling effect
            ground.update(currentSpeed);

            // Update background with parallax scrolling
            background.update(currentSpeed);

        } else if (gameState === 'start') {
            // Bobbing animation handled in render
        }
    },
    render
);

// Start the game loops
gameLoop.startUpdateLoop();
gameLoop.startRenderLoop(render);

// Draw difficulty indicator on canvas
function drawDifficultyIndicator() {
    const difficultyInfo = pipeManager.getDifficultyInfo();
    
    // Semi-transparent background for the HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(canvas.width - 165, 10, 155, 75);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 165, 10, 155, 75);
    
    // Difficulty level
    ctx.fillStyle = getDifficultyColor(difficultyInfo.level);
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`LEVEL ${difficultyInfo.level}`, canvas.width - 20, 30);
    
    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`Speed: ${difficultyInfo.pipeSpeed.toFixed(1)}`, canvas.width - 20, 48);
    ctx.fillText(`Gap: ${difficultyInfo.gap.toFixed(0)}px`, canvas.width - 20, 63);
    ctx.fillText(`Spawn: ${difficultyInfo.spawnInterval}f`, canvas.width - 20, 78);
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
    gameState = 'playing';
    score = 0;
    coinsCollected = 0;
    bestScore = getBestScore();
    totalCoins = getTotalCoins();
    
    bird.reset();
    pipeManager.reset();
    ground.reset();
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