import { Projectile } from './projectiles.js';

export class SupportShip {
    constructor(game, y) {
        this.game = game;
        this.width = 50;
        this.height = 40;
        this.x = -this.width;
        this.y = y;
        this.speedX = 3;
        this.state = 'entering'; // entering, firing, leaving
        this.markedForDeletion = false;

        this.fireDuration = 10000; // 10 секунд
        this.shootTimer = 0;
        this.shootInterval = 500; // Стреляет каждые 0.5 секунды
    }

    update(deltaTime) {
        if (this.state === 'entering') {
            this.x += this.speedX;
            if (this.x >= 50) {
                this.x = 50;
                this.state = 'firing';
            }
        } else if (this.state === 'firing') {
            this.fireDuration -= deltaTime;
            if (this.fireDuration <= 0) {
                this.state = 'leaving';
            }

            if (this.shootTimer <= 0) {
                this.shoot();
                this.shootTimer = this.shootInterval;
            } else {
                this.shootTimer -= deltaTime;
            }
        } else if (this.state === 'leaving') {
            this.x -= this.speedX;
            if (this.x + this.width < 0) {
                this.markedForDeletion = true;
            }
        }
    }

    draw(context) {
        context.fillStyle = 'limegreen';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    shoot() {
        this.game.player.projectiles.push(new Projectile(this.game, this.x + this.width, this.y + this.height * 0.2, -1));
        this.game.player.projectiles.push(new Projectile(this.game, this.x + this.width, this.y + this.height * 0.5, 0));
        this.game.player.projectiles.push(new Projectile(this.game, this.x + this.width, this.y + this.height * 0.8, 1));
        this.game.playSound('bulletStart2');
    }
}