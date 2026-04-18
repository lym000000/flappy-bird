// Particle Effects System
// Handles screen shake, death particles, and wing/feather trail effects


// ============================================================
// PARTICLE CLASS
// ============================================================
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 4;
        this.vy = options.vy || (Math.random() - 0.5) * 4;
        this.life = options.life || 60; // frames
        this.maxLife = this.life;
        this.size = options.size || 3;
        this.color = options.color || '#f1c40f';
        this.gravity = options.gravity || 0.1;
        this.friction = options.friction || 0.99;
        this.rotation = options.rotation || Math.random() * Math.PI * 2;
        this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.3;
        this.alive = true;
        this.shape = options.shape || 'circle'; // 'circle', 'square', 'feather'
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life--;

        if (this.life <= 0) {
            this.alive = false;
        }
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.shape === 'feather') {
            this.drawFeather(ctx, alpha);
        } else if (this.shape === 'spark') {
            this.drawSpark(ctx, alpha);
        } else {
            ctx.fillStyle = this.color;
            // Clamp the effective size to minimum 0.5 to avoid negative/zero radius errors
            const effectiveSize = Math.max(0.5, this.size * alpha);
            if (this.shape === 'square') {
                ctx.fillRect(-effectiveSize / 2, -effectiveSize / 2, effectiveSize, effectiveSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, effectiveSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    drawFeather(ctx, alpha) {
        // Draw a small feather shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.3, this.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Center line
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.2);
        ctx.lineTo(0, this.size * 1.2);
        ctx.stroke();
    }

    drawSpark(ctx, alpha) {
        // Draw a bright spark/star shape
        // Clamp the size to minimum 0.5 to avoid negative/zero radius errors
        const s = Math.max(0.5, this.size * alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * s;
            const y = Math.sin(angle) * s;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// ============================================================
// SCREEN SHAKE SYSTEM
// ============================================================
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.decay = 0.9;
        this.x = 0;
        this.y = 0;
    }

    trigger(intensity) {
        this.intensity = Math.max(this.intensity, intensity);
    }

    update() {
        if (this.intensity > 0.5) {
            this.x = (Math.random() - 0.5) * this.intensity * 2;
            this.y = (Math.random() - 0.5) * this.intensity * 2;
            this.intensity *= this.decay;
        } else {
            this.x = 0;
            this.y = 0;
            this.intensity = 0;
        }
    }

    getOffset() {
        return { x: this.x, y: this.y };
    }
}

// ============================================================
// PARTICLE EMITTERS
// ============================================================

// Death explosion effect
function createDeathParticles(x, y) {
    const particles = [];
    const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#ff6b35', '#ff9999'];

    // Main body fragments (larger pieces)
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        particles.push(new Particle(x, y, {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60 + Math.random() * 30,
            size: 4 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: 0.15,
            shape: Math.random() > 0.5 ? 'square' : 'circle'
        }));
    }

    // Small debris
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, {
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 40 + Math.random() * 20,
            size: 1.5 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: 0.2,
            shape: 'circle'
        }));
    }

    // Sparks
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, {
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 3,
            life: 20 + Math.random() * 15,
            size: 1 + Math.random() * 1.5,
            color: '#ffffff',
            gravity: 0.1,
            shape: 'spark'
        }));
    }

    return particles;
}

// Wing/feather trail particles (emitted during flapping)
function createFeatherTrail(x, y) {
    const particles = [];
    const colors = ['#f1c40f', '#f39c12', '#f5b041'];

    // Each flap releases 1-2 feathers
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x + (Math.random() - 0.5) * 10,
            y + (Math.random() - 0.5) * 10,
            {
                vx: -1 - Math.random() * 1.5, // Drift backward
                vy: 1 + Math.random() * 1.5,  // Fall downward
                life: 30 + Math.random() * 20,
                size: 2 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.05,
                friction: 0.98,
                shape: 'feather',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            }
        ));
    }

    return particles;
}

// Collision with pipe particles (small impact sparks)
function createPipeCollisionParticles(x, y) {
    const particles = [];
    const colors = ['#ffffff', '#f0f0f0', '#e0e0e0'];

    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, {
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 15 + Math.random() * 10,
            size: 1 + Math.random() * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: 0.05,
            shape: 'spark'
        }));
    }

    return particles;
}

// Score milestone particles (small burst when scoring)
function createScoreParticles(x, y) {
    const particles = [];
    const colors = ['#2ecc71', '#27ae60', '#82e0aa'];

    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y, {
            vx: (Math.random() - 0.5) * 3,
            vy: -1 - Math.random() * 2,
            life: 20 + Math.random() * 10,
            size: 1.5 + Math.random() * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: -0.05, // Float upward
            shape: 'circle'
        }));
    }

    return particles;
}

// ============================================================
// PARTICLE MANAGER
// ============================================================
class ParticleManager {
    constructor() {
        this.particles = [];
        this.screenShake = new ScreenShake();
        this.featherTrailTimer = 0;
    }

    addParticles(particleArray) {
        if (Array.isArray(particleArray)) {
            this.particles.push(...particleArray);
        } else {
            this.particles.push(particleArray);
        }
    }

    triggerScreenShake(intensity) {
        this.screenShake.trigger(intensity);
    }

    update() {
        // Update particles
        this.particles = this.particles.filter(p => p.alive);
        for (const particle of this.particles) {
            particle.update();
        }

        // Update screen shake
        this.screenShake.update();
    }

    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    // Get screen shake offset (caller is responsible for applying/restoring)
    getScreenShakeOffset() {
        return this.screenShake.getOffset();
    }

    // Reset everything
    reset() {
        this.particles = [];
        this.screenShake = new ScreenShake();
        this.featherTrailTimer = 0;
    }
}

// ============================================================
// GLOBAL PARTICLE MANAGER
// ============================================================
let particleManager = null;

function getParticleManager() {
    if (!particleManager) {
        particleManager = new ParticleManager();
    }
    return particleManager;
}

function resetParticleManager() {
    if (particleManager) {
        particleManager.reset();
    }
    particleManager = new ParticleManager();
    return particleManager;
}

export {
    Particle,
    ParticleManager,
    ScreenShake,
    createDeathParticles,
    createFeatherTrail,
    createPipeCollisionParticles,
    createScoreParticles,
    getParticleManager,
    resetParticleManager
};