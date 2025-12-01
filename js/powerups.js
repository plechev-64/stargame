class PowerUp {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.markedForDeletion = false;
        this.speedX = -1.5; // Скорость как у препятствий
    }
    update() {
        this.x += this.speedX - this.game.speed;
        if (this.x + this.width < 0) this.markedForDeletion = true;
    }
}

export class Heart extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.width = 30; this.height = 30; }
    draw(context) {
        context.fillStyle = 'tomato'; context.beginPath();
        context.moveTo(this.x + 15, this.y + 7);
        context.bezierCurveTo(this.x + 15, this.y + 5, this.x + 12, this.y, this.x, this.y + 7);
        context.bezierCurveTo(this.x - 15, this.y + 22, this.x + 15, this.y + 30, this.x + 15, this.y + 30);
        context.bezierCurveTo(this.x + 15, this.y + 30, this.x + 45, this.y + 22, this.x + 30, this.y + 7);
        context.bezierCurveTo(this.x + 28, this.y, this.x + 15, this.y + 5, this.x + 15, this.y + 7);
        context.fill();
    }
    applyEffect() { if (this.game.player.lives < this.game.player.maxLives) this.game.player.lives++; this.game.playSound('goal'); }
}

export class Nuke extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.radius = 15; this.width = 30; this.height = 30; }
    draw(context) {
        context.beginPath(); context.fillStyle = 'white'; context.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2); context.fill();
        context.beginPath(); context.fillStyle = 'lightblue'; context.arc(this.x + this.radius, this.y + this.radius, this.radius * 0.6, 0, Math.PI * 2); context.fill();
    }
    applyEffect() {
        this.game.enemies.forEach(enemy => { this.game.score += enemy.score; enemy.markedForDeletion = true; });
        this.game.triggerScreenFlash('white', 300);
        this.game.playSound('goal');
    }
}

export class DamageBoost extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.width = 25; this.height = 25; }
    draw(context) {
        context.fillStyle = 'magenta'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'white'; context.font = '20px Helvetica'; context.fillText('↑', this.x + 7, this.y + 20);
    }
    applyEffect() { this.game.player.activateDamageBoost(); this.game.playSound('goal'); }
}

export class WeaponBonus extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.width = 30; this.height = 30; }
    draw(context) {
        context.fillStyle = 'cyan'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black'; context.font = '25px Helvetica'; context.fillText('W', this.x + 4, this.y + 24);
    }
    applyEffect() {
        const weapons = ['triple', 'homing', 'laser'];
        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
        this.game.player.setWeapon(randomWeapon);
        this.game.playSound('goal');
    }
}

export class AmmoBonus extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.width = 30; this.height = 30; }
    draw(context) {
        context.fillStyle = 'yellow'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black'; context.font = '25px Helvetica'; context.fillText('A', this.x + 7, this.y + 24);
    }
    applyEffect() {
        this.game.player.activateAmmoBoost();
        this.game.playSound('goal');
    }
}

export class ShieldBonus extends PowerUp {
    constructor(game, x, y) { super(game, x, y); this.width = 30; this.height = 30; }
    draw(context) {
        context.fillStyle = 'aqua'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black'; context.font = '25px Helvetica'; context.fillText('S', this.x + 7, this.y + 24);
    }
    applyEffect() {
        this.game.player.activateShield();
        this.game.playSound('goal');
    }
}