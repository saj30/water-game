class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.color = 'green';

        // Stats
        this.speed = 4;
        this.strength = 10;
        this.vitality = 50;
        this.maxHealth = 50;
        this.health = 50;

        // XP & stat points
        this.xp = 0;
        this.xpMax = 20;
        this.statPoints = 0;

        // Attack
        this.attacking = false;
        this.attackTimer = 0;
        this.attackDuration = 250;
        this.attackBaseAngle = 0;
        this.attackSwingArc = Math.PI / 2;
        this.enemiesHitThisSwing = new Set();

        // For interpolation
        this.prevX = this.x;
        this.prevY = this.y;
    }

    update(keys, mouse, canvas) {
        this.prevX = this.x;
        this.prevY = this.y;

        // Movement
        let vx = 0, vy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) vy -= this.speed;
        if (keys['KeyS'] || keys['ArrowDown']) vy += this.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) vx -= this.speed;
        if (keys['KeyD'] || keys['ArrowRight']) vx += this.speed;
        this.x += vx;
        this.y += vy;
        this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));

        // Attack logic
        if (this.attacking) {
            this.attackTimer -= 16;
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.enemiesHitThisSwing.clear();
            }
        }
    }

    startAttack(mouse) {
        if (!this.attacking) {
            this.attacking = true;
            this.attackTimer = this.attackDuration;
            this.enemiesHitThisSwing.clear();
            const px = this.x + this.size / 2;
            const py = this.y + this.size / 2;
            this.attackBaseAngle = Math.atan2(mouse.y - py, mouse.x - px);
        }
    }

    // Returns sword line endpoints if attacking, else null
    getSwordLine() {
        if (!this.attacking) return null;
        const px = this.x + this.size / 2;
        const py = this.y + this.size / 2;
        const swordLength = 50;
        const progress = 1 - (this.attackTimer / this.attackDuration);
        const swingStart = this.attackBaseAngle - this.attackSwingArc / 2;
        const swingEnd = this.attackBaseAngle + this.attackSwingArc / 2;
        const swingAngle = swingStart + (swingEnd - swingStart) * progress;
        const sx = px + Math.cos(swingAngle) * swordLength;
        const sy = py + Math.sin(swingAngle) * swordLength;
        return { x1: px, y1: py, x2: sx, y2: sy };
    }

    isAttacking(enemy) {
        if (!this.attacking || this.enemiesHitThisSwing.has(enemy)) return false;
        const sword = this.getSwordLine();
        if (!sword) return false;
        // Simple collision: check if enemy center is near sword line
        const ex = enemy.x + enemy.size / 2;
        const ey = enemy.y + enemy.size / 2;
        const dist = this.#pointToLineDist(ex, ey, sword.x1, sword.y1, sword.x2, sword.y2);
        if (dist < enemy.size / 2 + 8) {
            this.enemiesHitThisSwing.add(enemy);
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    refillHealth() {
        this.health = this.maxHealth;
    }

    upgradeStat(stat) {
        if (stat === 'speed') this.speed += 1;
        if (stat === 'strength') this.strength += 2;
        if (stat === 'vitality') {
            this.vitality += 5;
            this.maxHealth += 5;
        }
        this.refillHealth();
    }

    draw(ctx, alpha = 1) {
        const drawX = this.prevX + (this.x - this.prevX) * alpha;
        const drawY = this.prevY + (this.y - this.prevY) * alpha;

        // Health bar (top left)
        const barX = 16, barY = 16, barW = 100, barH = 14, radius = 6;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.#roundedRect(ctx, barX, barY, barW, barH, radius);
        ctx.fill();
        const healthW = barW * (this.health / this.maxHealth);
        if (healthW > 0) {
            ctx.fillStyle = 'limegreen';
            this.#roundedRect(ctx, barX, barY, healthW, barH, radius);
            ctx.fill();
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'black';
        this.#roundedRect(ctx, barX, barY, barW, barH, radius);
        ctx.stroke();
        ctx.restore();

        // XP bar (below health bar)
        const xpBarX = 16, xpBarY = 36, xpBarW = 100, xpBarH = 10, xpRadius = 5;
        ctx.save();
        ctx.fillStyle = '#444';
        this.#roundedRect(ctx, xpBarX, xpBarY, xpBarW, xpBarH, xpRadius);
        ctx.fill();
        const xpW = xpBarW * (this.xp / this.xpMax);
        if (xpW > 0) {
            ctx.fillStyle = 'yellow';
            this.#roundedRect(ctx, xpBarX, xpBarY, xpW, xpBarH, xpRadius);
            ctx.fill();
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'black';
        this.#roundedRect(ctx, xpBarX, xpBarY, xpBarW, xpBarH, xpRadius);
        ctx.stroke();
        ctx.restore();

        // Draw player
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, this.size, this.size);

        // Draw sword swing
        if (this.attacking) {
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 8;
            ctx.beginPath();
            const px = drawX + this.size / 2;
            const py = drawY + this.size / 2;
            const swordLength = 50;
            const progress = 1 - (this.attackTimer / this.attackDuration);
            const swingStart = this.attackBaseAngle - this.attackSwingArc / 2;
            const swingEnd = this.attackBaseAngle + this.attackSwingArc / 2;
            const swingAngle = swingStart + (swingEnd - swingStart) * progress;
            const sx = px + Math.cos(swingAngle) * swordLength;
            const sy = py + Math.sin(swingAngle) * swordLength;
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Helper for rounded rectangles
    #roundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // Helper: distance from point to line segment
    #pointToLineDist(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export default Player;