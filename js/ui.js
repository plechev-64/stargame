export class UI {
    constructor(game) { this.game = game; this.fontSize = 25; this.fontFamily = 'Helvetica'; this.color = 'white'; }
    draw(context) {
        context.save();
        context.fillStyle = this.color;
        context.shadowOffsetX = 2; context.shadowOffsetY = 2; context.shadowColor = 'black';
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        context.fillText(`Score: ${this.game.score}`, 20, 40);
        context.fillText(`Lives: ${this.game.player.lives}`, 20, 70);
        context.fillText(`Ammo: ${this.game.player.ammo}`, 20, 100);

        // Таймер поддержки
        const supportCooldown = this.game.player.supportCooldown;
        const supportTimer = this.game.player.supportTimer;
        if (supportTimer < supportCooldown) {
            context.fillStyle = 'gray';
            context.fillText(`Support: ${( (supportCooldown - supportTimer) / 1000).toFixed(1)}s`, 20, 130);
        } else {
            context.fillStyle = 'limegreen';
            context.fillText(`Support: READY`, 20, 130);
        }

        let bonusY = 160;
        if (this.game.player.damageBoostActive) {
            context.fillStyle = 'magenta';
            context.fillText(`Damage x3: ${(this.game.player.damageBoostTimer / 1000).toFixed(1)}s`, 20, bonusY);
            bonusY += 30;
        }
        if (this.game.player.shieldActive) {
            context.fillStyle = 'aqua';
            context.fillText(`Shield: ${(this.game.player.shieldTimer / 1000).toFixed(1)}s`, 20, bonusY);
            bonusY += 30;
        }
        if (this.game.player.ammoBoostActive) {
            context.fillStyle = 'yellow';
            context.fillText(`Max Ammo: ${(this.game.player.ammoBoostTimer / 1000).toFixed(1)}s`, 20, bonusY);
            bonusY += 30;
        }
        if (this.game.player.weapon !== 'default') {
            context.fillStyle = 'cyan';
            context.fillText(`Weapon: ${(this.game.player.weaponTimer / 1000).toFixed(1)}s`, 20, bonusY);
        }

        if (this.game.gameState === 'boss_intro') {
            context.textAlign = 'center'; context.font = `50px ${this.fontFamily}`;
            context.fillText('Boss Incoming!', this.game.width * 0.5, this.game.height * 0.5);
        }
        if (this.game.boss) {
            const boss = this.game.boss;
            const healthBarWidth = 400; const healthBarHeight = 30;
            const x = this.game.width / 2 - healthBarWidth / 2;
            const y = this.game.height - healthBarHeight - 20;
            context.strokeStyle = 'white'; context.lineWidth = 3;
            context.strokeRect(x, y, healthBarWidth, healthBarHeight);
            context.fillStyle = 'red';
            const currentHealth = (boss.lives / boss.maxLives) * healthBarWidth;
            context.fillRect(x, y, currentHealth > 0 ? currentHealth : 0, healthBarHeight);
        }
        if (this.game.gameOver) {
            context.textAlign = 'center';
            let message1 = this.game.score >= this.game.winningScore + 150 ? 'You Win!' : 'You Lose!';
            let message2 = this.game.score >= this.game.winningScore + 150 ? 'You are the champion!' : 'Try again!';
            context.font = `50px ${this.fontFamily}`;
            context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
            context.font = `25px ${this.fontFamily}`;
            context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
        }
        context.restore();
    }
}