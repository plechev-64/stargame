import { EnemyProjectile } from './projectiles.js';

class Enemy {
    constructor(game) {
        this.game = game; this.x = this.game.width;
        this.speedX = Math.random() * -1.0 - 0.2;
        this.markedForDeletion = false; this.lives = 5; this.score = this.lives;
        this.shootTimer = 0; this.shootInterval = 1500;
    }
    update(deltaTime) {
        this.x += this.speedX - this.game.speed;
        if (this.x + this.width < 0) this.markedForDeletion = true;
        if (this.shootTimer > this.shootInterval && this.x < this.game.width) {
            this.shoot(); this.shootTimer = 0;
        } else { this.shootTimer += deltaTime; }
    }
    draw(context) {
        context.fillStyle = 'red'; context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'white'; context.font = '20px Helvetica'; context.fillText(this.lives, this.x + this.width / 2, this.y - 5);
    }
    shoot() { this.game.enemyProjectiles.push(new EnemyProjectile(this.game, this.x, this.y + this.height / 2, -9)); }
}

export class Angler1 extends Enemy {
    constructor(game) {
        super(game);
        this.width = 80; this.height = 60;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
        this.lives = 3; this.score = this.lives;
        this.speedY = (Math.random() * 3 + 2) * (Math.random() > 0.5 ? 1 : -1);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
        if (this.y <= 0 || this.y >= this.game.height - this.height) {
            this.speedY *= -1;
        }
        if (this.game.player.x > this.x && this.game.player.y > this.y && this.game.player.y < this.y + this.height) {
            this.speedX = -16;
        }
    }
    draw(context) {
        context.fillStyle = '#8b0000'; // Темно-красный
        context.fillRect(this.x + 10, this.y, 70, 60);
        context.fillStyle = '#ff4500'; // Оранжево-красный
        context.fillRect(this.x, this.y + 15, 30, 30);
        context.fillStyle = 'yellow';
        context.fillRect(this.x + 60, this.y + 25, 10, 10);
        context.fillStyle = 'white'; context.font = '20px Helvetica'; context.fillText(this.lives, this.x + this.width / 2, this.y - 5);
    }
}

export class Angler2 extends Enemy {
    constructor(game) {
        super(game);
        this.width = 80; this.height = 60;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
        this.lives = 4; this.score = this.lives;
        this.speedY = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
    }
    update(deltaTime) {
        if (this.shootTimer > this.shootInterval && this.x < this.game.width) {
            this.shoot(); this.shootTimer = 0;
        } else { this.shootTimer += deltaTime; }
        this.y += this.speedY;
        if (this.y <= 0 || this.y >= this.game.height - this.height) {
            this.speedY *= -1;
        }
        this.x += this.speedX;
        if (this.speedX < 0 && this.x < this.game.width * 0.5) {
            this.x = this.game.width * 0.5;
            this.speedX *= -1;
        } else if (this.speedX > 0 && this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
            this.speedX *= -1;
        }
    }
    draw(context) {
        // Геометрия как у Angler1, но другие цвета
        context.fillStyle = '#006400'; // Темно-зеленый
        context.fillRect(this.x + 10, this.y, 70, 60);
        context.fillStyle = '#32cd32'; // Лаймово-зеленый
        context.fillRect(this.x, this.y + 15, 30, 30);
        context.fillStyle = 'cyan';
        context.fillRect(this.x + 60, this.y + 25, 10, 10);
        context.fillStyle = 'white'; context.font = '20px Helvetica'; context.fillText(this.lives, this.x + this.width / 2, this.y - 5);
    }
}

export class Boss extends Enemy {
    constructor(game) {
        super(game);
        this.width = 300; this.height = 200;
        this.x = this.game.width; this.y = this.game.height / 2 - this.height / 2;
        this.speedX = -1; this.lives = 100; this.maxLives = this.lives; this.score = 150;
        this.state = 'intro'; this.shootInterval = 800;
    }
    update(deltaTime) {
        if (this.state === 'intro') {
            this.x += this.speedX;
            if (this.x < this.game.width - this.width - 20) {
                this.x = this.game.width - this.width - 20; this.speedX = 0;
                this.state = 'active'; this.game.gameState = 'boss_battle';
            }
        } else if (this.state === 'active') {
            super.update(deltaTime);
            const targetY = this.game.player.y + this.game.player.height / 2 - this.height / 2;
            this.y += (targetY - this.y) * 0.05;
        }
    }
    draw(context) {
        context.save();
        // Основной корпус
        context.fillStyle = '#4B0082'; // Indigo
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Бронепластины
        context.fillStyle = 'darkslateblue';
        context.fillRect(this.x + 20, this.y - 10, this.width - 40, 10);
        context.fillRect(this.x + 20, this.y + this.height, this.width - 40, 10);
        context.fillRect(this.x + this.width, this.y + 20, 10, this.height - 40);

        // Орудийные башни
        context.fillStyle = 'gray';
        context.fillRect(this.x - 20, this.y + 40, 40, 20);
        context.fillRect(this.x - 20, this.y + 90, 40, 20);
        context.fillRect(this.x - 20, this.y + 140, 40, 20);

        // Ядро
        context.fillStyle = `rgba(255, 0, 255, ${0.5 + Math.random() * 0.3})`;
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + this.height / 2, 40, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
    shoot() {
        const yOffset = this.height / 4; const bulletSpeed = -10;
        this.game.enemyProjectiles.push(new EnemyProjectile(this.game, this.x, this.y + yOffset + 10, bulletSpeed));
        this.game.enemyProjectiles.push(new EnemyProjectile(this.game, this.x, this.y + yOffset * 2 + 10, bulletSpeed));
        this.game.enemyProjectiles.push(new EnemyProjectile(this.game, this.x, this.y + yOffset * 3 + 10, bulletSpeed));
        this.game.playSound('cannonShoot');
    }
}