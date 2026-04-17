// Game Loops - Render and Update
import { UPDATE_INTERVAL, BASE_PIPE_SPEED as PIPE_SPAWN_INTERVAL } from '../config/constants.js';

export class GameLoop {
    constructor(onUpdate, onPipeSpawn) {
        this.onUpdate = onUpdate;
        this.onPipeSpawn = onPipeSpawn;
        
        this.renderId = null;
        this.updateIntervalId = null;
        this.frameCount = 0;
    }

    get frameCount() {
        return this._frameCount;
    }

    set frameCount(value) {
        this._frameCount = value;
    }

    /**
     * Start the update loop (setInterval at capped 60 FPS)
     */
    startUpdateLoop() {
        this.updateIntervalId = setInterval(() => {
            this.frameCount++;
            this.onUpdate(this.frameCount);
        }, UPDATE_INTERVAL);
    }

    /**
     * Start the render loop (requestAnimationFrame)
     */
    startRenderLoop(renderCallback) {
        const render = () => {
            renderCallback();
            this.renderId = requestAnimationFrame(render);
        };
        this.renderId = requestAnimationFrame(render);
    }

    /**
     * Stop all game loops
     */
    stop() {
        if (this.renderId !== null) {
            cancelAnimationFrame(this.renderId);
            this.renderId = null;
        }
        if (this.updateIntervalId !== null) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = null;
        }
    }

    /**
     * Reset frame counter
     */
    resetFrameCount() {
        this.frameCount = 0;
    }
}