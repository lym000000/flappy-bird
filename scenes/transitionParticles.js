// Season Transition Particles
// Generates and updates particles that appear during season transitions
export class TransitionParticles {
    constructor() {
        this.particles = [];
    }

    reset() {
        this.particles = [];
    }

    generate(nextSeason, canvasWidth, canvasHeight, groundHeight) {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = this._createParticle(nextSeason.id, canvasWidth, canvasHeight, groundHeight);
            if (particle) {
                this.particles.push(particle);
            }
        }
    }

    update() {
        this.particles = this.particles.filter(p => p.life > 0);
        for (const p of this.particles) {
            p.life--;
            if (p.type === 'petal' || p.type === 'leaf') {
                p.x += p.vx + Math.sin(p.wobbleSpeed * (p.maxLife - p.life)) * p.wobbleAmount;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
            }
        }
    }

    draw(ctx) {
        const particles = this.particles;
        if (particles.length === 0) return;

        ctx.save();
        for (const p of particles) {
            const alpha = Math.min(1, p.life / (p.maxLife * 0.3));

            if (p.type === 'petal' || p.type === 'leaf') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                if (p.type === 'petal') {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.3, p.size * 0.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.7, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (p.type === 'heat') {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'iceCrystal') {
                ctx.globalAlpha = alpha * 0.6;
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
        }
        ctx.restore();
    }

    _createParticle(seasonId, canvasWidth, canvasHeight, groundHeight) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight * 0.6;

        switch (seasonId) {
            case 'spring':
                return {
                    x: -20,
                    y: Math.random() * canvasHeight * 0.5,
                    vx: 1.5 + Math.random() * 1.5,
                    vy: 0.5 + Math.random() * 1,
                    size: 3 + Math.random() * 4,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    color: this._randomColor(['#FF69B4', '#FFB6C1', '#FF1493', '#FFA07A']),
                    life: 300 + Math.random() * 200,
                    maxLife: 500,
                    type: 'petal',
                    wobbleSpeed: 0.02 + Math.random() * 0.02,
                    wobbleAmount: 0.5 + Math.random() * 0.5
                };

            case 'summer':
                return {
                    x: x,
                    y: canvasHeight - groundHeight - Math.random() * 100,
                    vx: 0,
                    vy: -0.3 - Math.random() * 0.3,
                    size: 2 + Math.random() * 3,
                    color: 'rgba(255, 200, 50, 0.3)',
                    life: 60 + Math.random() * 40,
                    maxLife: 100,
                    type: 'heat'
                };

            case 'autumn': {
                const leafColors = ['#FF4500', '#FF6347', '#FF8C00', '#CD853F', '#8B4513'];
                return {
                    x: -10,
                    y: Math.random() * canvasHeight * 0.4,
                    vx: 2 + Math.random() * 2,
                    vy: 1 + Math.random() * 1.5,
                    size: 5 + Math.random() * 6,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: 0.05 + Math.random() * 0.1,
                    color: this._randomColor(leafColors),
                    life: 200 + Math.random() * 150,
                    maxLife: 350,
                    type: 'leaf',
                    wobbleSpeed: 0.03 + Math.random() * 0.03,
                    wobbleAmount: 1 + Math.random() * 1.5
                };
            }

            case 'winter':
                return {
                    x: Math.random() * canvasWidth,
                    y: -10,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: 0.5 + Math.random() * 1.5,
                    size: 1 + Math.random() * 3,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    color: 'rgba(200, 220, 255, 0.7)',
                    life: 300 + Math.random() * 200,
                    maxLife: 500,
                    type: 'iceCrystal'
                };
        }
        return null;
    }

    _randomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
