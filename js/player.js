import { Projectile, HomingMissile, LaserBeam } from './projectiles.js';
import { SupportShip } from './support.js';

export class Player {
    constructor(game) {
        this.game = game; this.width = 120; this.height = 80;
        this.x = 20; this.y = 100;
        this.speedY = 0; this.speedX = 0; this.maxSpeed = 5;
        this.projectiles = []; this.lives = 10; this.maxLives = this.lives;
        
        // Бонусы
        this.damage = 1; this.damageBoostTimer = 0; this.damageBoostActive = false;
        this.shieldActive = false; this.shieldTimer = 0;

        this.weapon = 'default'; this.weaponTimer = 0;
        this.weaponInterval = 20000;
        
        // Боезапас
        this.ammo = 10;
        this.defaultMaxAmmo = 25;
        this.maxAmmo = this.defaultMaxAmmo;
        this.ammoTimer = 0;
        this.ammoInterval = 700;
        this.ammoBoostActive = false;
        this.ammoBoostTimer = 0;

        this.shootTimer = 0; this.shootInterval = 120;

        // Поддержка
        this.supportShips = [];
        this.supportCooldown = 90000;
        this.supportTimer = this.supportCooldown;
    }
    update(deltaTime) {
        if (this.game.input.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
        else if (this.game.input.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
        else this.speedY = 0;
        if (this.game.input.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
        else if (this.game.input.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
        else this.speedX = 0;
        this.y += this.speedY; this.x += this.speedX;
        if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;
        if (this.y < 0) this.y = 0;
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        
        this.projectiles.forEach(p => p.update(deltaTime));
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        
        this.supportShips.forEach(s => s.update(deltaTime));
        this.supportShips = this.supportShips.filter(s => !s.markedForDeletion);

        if (this.ammo < this.maxAmmo) {
            this.ammoTimer += deltaTime;
            if (this.ammoTimer > this.ammoInterval) {
                this.ammo++;
                this.ammoTimer = 0;
            }
        }
        if (this.shootTimer > 0) this.shootTimer -= deltaTime;
        if (this.game.input.keys.includes(' ') && this.shootTimer <= 0) {
            this.shootTop();
            this.shootTimer = this.shootInterval;
        }

        // Таймеры
        if (this.supportTimer < this.supportCooldown) this.supportTimer += deltaTime;
        if (this.damageBoostTimer > 0) {
            this.damageBoostTimer -= deltaTime;
            if (this.damageBoostTimer <= 0) { this.damage = 1; this.damageBoostActive = false; }
        }
        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) { this.shieldActive = false; }
        }
        if (this.ammoBoostTimer > 0) {
            this.ammoBoostTimer -= deltaTime;
            if (this.ammoBoostTimer <= 0) {
                this.maxAmmo = this.defaultMaxAmmo;
                if (this.ammo > this.maxAmmo) this.ammo = this.maxAmmo;
                this.ammoBoostActive = false;
            }
        }
        if (this.weaponTimer > 0) {
            this.weaponTimer -= deltaTime;
            if (this.weaponTimer <= 0) this.weapon = 'default';
        }
    }
    draw(context) {
        context.save();
        // Основной корпус
        context.fillStyle = '#cccccc';
        context.beginPath();
        context.moveTo(this.x, this.y + 20);
        context.lineTo(this.x + 100, this.y + 30);
        context.lineTo(this.x + 100, this.y + 50);
        context.lineTo(this.x, this.y + 60);
        context.closePath();
        context.fill();

        // Крылья
        context.fillStyle = '#aaaaaa';
        context.beginPath();
        context.moveTo(this.x + 20, this.y + 20);
        context.lineTo(this.x + 60, this.y);
        context.lineTo(this.x + 70, this.y + 20);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(this.x + 20, this.y + 60);
        context.lineTo(this.x + 60, this.y + 80);
        context.lineTo(this.x + 70, this.y + 60);
        context.closePath();
        context.fill();

        // Кабина
        context.fillStyle = '#66ccff';
        context.beginPath();
        context.moveTo(this.x + 90, this.y + 30);
        context.lineTo(this.x + 120, this.y + 40);
        context.lineTo(this.x + 90, this.y + 50);
        context.closePath();
        context.fill();

        // Двигатель
        if (this.speedX !== 0 || this.speedY !== 0) {
            context.fillStyle = `rgba(255, 165, 0, ${Math.random() * 0.5 + 0.5})`;
            context.beginPath();
            context.moveTo(this.x - 10, this.y + 35);
            context.lineTo(this.x, this.y + 40);
            context.lineTo(this.x - 10, this.y + 45);
            context.closePath();
            context.fill();
        }
        
        context.restore();

        this.projectiles.forEach(p => p.draw(context));
        this.supportShips.forEach(s => s.draw(context));

        if (this.shieldActive) {
            context.save();
            context.globalAlpha = 0.3 + Math.abs(Math.sin(this.shieldTimer * 0.001)) * 0.4;
            context.fillStyle = 'aqua';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.7, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }
    shootTop() {
        if (this.ammo > 0) {
            this.ammo--;
            this.game.playSound('bulletStart2');
            switch (this.weapon) {
                case 'triple':
                    this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 30, -2));
                    this.projectiles.push(new Projectile(this.game, this.x + 120, this.y + 40, 0));
                    this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 50, 2));
                    break;
                case 'homing':
                    this.projectiles.push(new HomingMissile(this.game, this.x + 120, this.y + 40));
                    break;
                case 'laser':
                    this.projectiles.push(new LaserBeam(this.game, this.x + 120, this.y + 40));
                    this.shootTimer = 300;
                    break;
                default:
                    this.projectiles.push(new Projectile(this.game, this.x + 120, this.y + 40));
                    break;
            }
        }
    }
    callSupport() {
        if (this.supportTimer >= this.supportCooldown) {
            this.supportTimer = 0;
            this.supportShips.push(new SupportShip(this.game, this.game.height * 0.25));
            this.supportShips.push(new SupportShip(this.game, this.game.height * 0.75));
        }
    }
    activateDamageBoost() { this.damage = 3; this.damageBoostActive = true; this.damageBoostTimer = 10000; }
    activateAmmoBoost() {
        this.maxAmmo = this.defaultMaxAmmo * 2;
        this.ammo = this.maxAmmo;
        this.ammoBoostActive = true;
        this.ammoBoostTimer = 10000;
    }
    activateShield() {
        this.shieldActive = true;
        this.shieldTimer = 10000;
    }
    setWeapon(type) { this.weapon = type; this.weaponTimer = this.weaponInterval; }
}