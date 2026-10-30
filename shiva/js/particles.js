/**
 * Particle & Visual FX Engine (HTML5 Canvas Overlay)
 * Handles candy pops, striped beams, wrapped shockwaves, color bomb arcs, floating score texts, and confetti!
 */

class FXEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.floatingTexts = [];
        this.beams = [];
        this.shockwaves = [];
        this.lightningArcs = [];
        this.confetti = [];
        this.animId = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop = this.loop.bind(this);
        this.loop();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * (window.devicePixelRatio || 1);
        this.canvas.height = rect.height * (window.devicePixelRatio || 1);
        this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        this.width = rect.width;
        this.height = rect.height;
    }

    // Candy pop particles
    createPop(x, y, color = '#ff2e63', count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                gravity: 0.18,
                radius: 3 + Math.random() * 4,
                color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                sparkle: Math.random() > 0.4
            });
        }
    }

    // Floating score / praise popups
    createFloatingText(x, y, text, color = '#ffffff', fontSize = 24, isPraise = false) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            fontSize,
            isPraise,
            scale: isPraise ? 0.4 : 0.8,
            targetScale: isPraise ? 1.3 : 1.0,
            vy: isPraise ? -1.0 : -2.0,
            alpha: 1,
            decay: isPraise ? 0.012 : 0.025
        });
    }

    // Striped candy laser blast beam
    createStripedBeam(x, y, direction = 'horizontal') {
        this.beams.push({
            x,
            y,
            direction,
            alpha: 1,
            thickness: 24,
            maxThickness: 34,
            progress: 0,
            color: '#fff',
            glowColor: '#ffd700'
        });
    }

    // Wrapped candy explosion shockwave
    createShockwave(x, y, color = '#ff9f1a') {
        this.shockwaves.push({
            x,
            y,
            radius: 10,
            maxRadius: 130,
            alpha: 1,
            color
        });

        // Add lots of fiery explosion sparks
        this.createPop(x, y, color, 30);
    }

    // Color bomb rainbow lightning arc to targets
    createLightning(startX, startY, targetX, targetY, color = '#ffd700') {
        this.lightningArcs.push({
            startX,
            startY,
            targetX,
            targetY,
            color,
            alpha: 1,
            life: 18,
            maxLife: 18
        });
    }

    // Confetti shower for level victory
    triggerVictoryConfetti() {
        const colors = ['#ff2e63', '#00d2fc', '#ff9234', '#1dd1a1', '#ffd32a', '#9b59b6', '#ffffff'];
        for (let i = 0; i < 120; i++) {
            this.confetti.push({
                x: Math.random() * this.width,
                y: -20 - Math.random() * 100,
                vx: -2 + Math.random() * 4,
                vy: 3 + Math.random() * 5,
                size: 6 + Math.random() * 8,
                rotation: Math.random() * 360,
                rotSpeed: -5 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1
            });
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Render Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.15;
            sw.alpha -= 0.04;

            if (sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.lineWidth = 8 * sw.alpha;
            this.ctx.strokeStyle = sw.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = sw.color;
            this.ctx.globalAlpha = sw.alpha;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 2. Render Striped Laser Beams
        for (let i = this.beams.length - 1; i >= 0; i--) {
            const b = this.beams[i];
            b.alpha -= 0.05;
            b.thickness = Math.max(0, b.thickness * 0.92);

            if (b.alpha <= 0) {
                this.beams.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = b.alpha;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = b.glowColor;

            if (b.direction === 'horizontal') {
                const grad = this.ctx.createLinearGradient(0, b.y - b.thickness, 0, b.y + b.thickness);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                grad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(0, b.y - b.thickness, this.width, b.thickness * 2);
            } else {
                const grad = this.ctx.createLinearGradient(b.x - b.thickness, 0, b.x + b.thickness, 0);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                grad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(b.x - b.thickness, 0, b.thickness * 2, this.height);
            }
            this.ctx.restore();
        }

        // 3. Render Lightning Arcs (Color bomb)
        for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
            const arc = this.lightningArcs[i];
            arc.life--;
            arc.alpha = arc.life / arc.maxLife;

            if (arc.life <= 0) {
                this.lightningArcs.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.strokeStyle = arc.color;
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = arc.color;
            this.ctx.globalAlpha = arc.alpha;

            this.ctx.beginPath();
            this.ctx.moveTo(arc.startX, arc.startY);

            // Jittery lightning segments
            const steps = 6;
            const dx = (arc.targetX - arc.startX) / steps;
            const dy = (arc.targetY - arc.startY) / steps;

            for (let s = 1; s < steps; s++) {
                const jitterX = (Math.random() - 0.5) * 20;
                const jitterY = (Math.random() - 0.5) * 20;
                this.ctx.lineTo(arc.startX + dx * s + jitterX, arc.startY + dy * s + jitterY);
            }

            this.ctx.lineTo(arc.targetX, arc.targetY);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 4. Render Sugar Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.sparkle ? '#ffffff' : p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, p.radius * p.alpha), 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 5. Render Confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotSpeed;

            if (c.y > this.height + 30) {
                this.confetti.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate((c.rotation * Math.PI) / 180);
            this.ctx.fillStyle = c.color;
            this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            this.ctx.restore();
        }

        // 6. Render Floating Score Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= ft.decay;
            ft.scale += (ft.targetScale - ft.scale) * 0.15;

            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = ft.alpha;
            this.ctx.translate(ft.x, ft.y);
            this.ctx.scale(ft.scale, ft.scale);

            this.ctx.font = `900 ${ft.fontSize}px 'Fredoka', 'Nunito', 'Segoe UI', sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Thick candy stroke outline
            this.ctx.lineWidth = ft.isPraise ? 7 : 5;
            this.ctx.strokeStyle = '#2b0938';
            this.ctx.strokeText(ft.text, 0, 0);

            // Vibrant text fill
            this.ctx.fillStyle = ft.color;
            this.ctx.fillText(ft.text, 0, 0);

            this.ctx.restore();
        }

        this.animId = requestAnimationFrame(this.loop);
    }
}

window.FXEngine = FXEngine;

