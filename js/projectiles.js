export class Projectile {
    constructor(game, x, y, speedY = 0) {
        this.game = game; this.x = x; this.y = y;
        this.width = 12; this.height = 5;
        this.speed = 12; this.speedY = speedY;
        this.markedForDeletion = false;
    }
    update() {
        this.x += this.speed;
        this.y += this.speedY;
        if (this.x > this.game.width * 0.95) this.markedForDeletion = true;
    }
    draw(context) {
        context.fillStyle = 'white'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'yellow'; context.fillRect(this.x + 2, this.y + 1, this.width - 4, this.height - 2);
    }
}

export class HomingMissile extends Projectile {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 15; this.height = 8;
        this.speed = 8;
        this.turnRate = 0.1;
        this.angle = 0;
        this.target = null;
    }
    findTarget() {
        let closestDistance = Infinity;
        let closestEnemy = null;
        this.game.enemies.forEach(enemy => {
            const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        if (this.game.boss && this.game.boss.state === 'active') {
             const distance = Math.hypot(this.x - this.game.boss.x, this.y - this.game.boss.y);
             if (distance < closestDistance) {
                this.target = this.game.boss;
                return;
             }
        }
        this.target = closestEnemy;
    }
    update() {
        this.findTarget();
        if (this.target) {
            const targetAngle = Math.atan2(this.target.y + this.target.height / 2 - this.y, this.target.x + this.target.width / 2 - this.x);
            this.angle += (targetAngle - this.angle) * this.turnRate;
        }
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        if (this.x > this.game.width) this.markedForDeletion = true;
    }
    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.fillStyle = '#f0f';
        context.fillRect(0, -this.height * 0.5, this.width, this.height);
        context.restore();
    }
}

export class LaserBeam {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y - 2; // Center the beam
        this.width = this.game.width - x;
        this.height = 4;
        this.damage = this.game.player.damage * 2;
        this.markedForDeletion = false;
        this.timer = 100; // Visual effect timer
    }
    update(deltaTime) {
        this.timer -= deltaTime;
        if (this.timer <= 0) this.markedForDeletion = true;
    }
    draw(context) {
        context.save();
        context.fillStyle = 'cyan';
        context.shadowColor = 'white';
        context.shadowBlur = 10;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.restore();
    }
}

export class EnemyProjectile {
    constructor(game, x, y, speed = -3) {
        this.game = game; this.x = x; this.y = y;
        this.width = 10; this.height = 10;
        this.speed = speed; this.markedForDeletion = false;
    }
    update() { this.x += this.speed; if (this.x < 0) this.markedForDeletion = true; }
    draw(context) {
        context.fillStyle = '#ff4500'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'orange'; context.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }
}