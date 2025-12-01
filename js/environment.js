export class Obstacle {
    constructor(game) {
        this.game = game; this.radius = Math.random() * 30 + 30;
        this.x = this.game.width + this.radius; this.y = Math.random() * (this.game.height - this.radius * 2) + this.radius;
        this.speedX = -1.5; this.markedForDeletion = false;
    }
    update() {
        this.x += this.speedX - this.game.speed;
        if (this.x + this.radius < 0) this.markedForDeletion = true;
    }
    draw(context) {
        context.beginPath(); context.fillStyle = '#4a4a4a'; context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); context.fill();
        context.beginPath(); context.fillStyle = 'rgba(255,255,255,0.2)'; context.arc(this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.8, 0, Math.PI * 2); context.fill();
    }
}

class Star {
    constructor(game) {
        this.game = game;
        this.x = Math.random() * this.game.width; this.y = Math.random() * this.game.height;
        this.speed = Math.random() * 10 + 5;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
    }
    reset() {
        this.x = this.game.width; this.y = Math.random() * this.game.height;
        this.speed = Math.random() * 10 + 5;
        this.size = Math.random() * 1.5 + 0.5;
    }
    update() {
        this.x -= this.speed;
        if (this.x < 0) this.reset();
    }
    draw(context) {
        context.fillStyle = this.color; context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2); context.fill();
    }
}

export class Background {
    constructor(game) {
        this.game = game; this.stars = [];
        this.numberOfStars = 70; this.createStars();
    }
    createStars() { for (let i = 0; i < this.numberOfStars; i++) this.stars.push(new Star(this.game)); }
    update() {
        if (this.game.speed > 0) {
            this.stars.forEach(star => star.update());
        }
    }
    draw(context) { this.stars.forEach(star => star.draw(context)); }
}