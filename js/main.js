import { Player } from './player.js';
import { InputHandler, checkCollision } from './utils.js';
import { UI } from './ui.js';
import { Angler1, Angler2, Boss } from './enemies.js';
import { Background, Obstacle } from './environment.js';
import { Heart, Nuke, DamageBoost, WeaponBonus, AmmoBonus, ShieldBonus } from './powerups.js';
import { LaserBeam } from './projectiles.js';

window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Game {
        constructor(width, height) {
            this.width = width; this.height = height;
            this.background = new Background(this);
            this.player = new Player(this); this.input = new InputHandler(this); this.ui = new UI(this);
            this.enemies = []; this.enemyProjectiles = []; this.obstacles = []; this.powerUps = [];
            this.boss = null;
            this.enemyTimer = 0; this.enemyInterval = 1000;
            this.obstacleTimer = 0; this.obstacleInterval = 4000;
            this.gameOver = false; this.score = 0;
            this.winningScore = 200; // Увеличено до 200
            this.speed = 1; this.gameState = 'playing';
            this.screenFlashTimer = 0; this.screenFlashColor = 'rgba(255, 0, 0, 0.2)';
            this.maxEnemies = 1;
            this.maxObstacles = 0;
            
            this.baseDropChance = 0.15;
            this.noDropTimer = 0;
            this.basePowerUpProbabilities = {
                heart: 0.15, nuke: 0.1, damageBoost: 0.2,
                weaponBonus: 0.2, ammoBonus: 0.2, shieldBonus: 0.15,
            };
            this.powerUpProbabilities = { ...this.basePowerUpProbabilities };

            this.sounds = {
                bulletStart: document.getElementById('sound-bulletStart'),
                bulletStart2: document.getElementById('sound-bulletStart2'),
                cannonShoot: document.getElementById('sound-cannonShoot'),
                fail: document.getElementById('sound-fail'),
                gameOver: document.getElementById('sound-gameOver'),
                goal: document.getElementById('sound-goal'),
                theme: document.getElementById('sound-theme'),
            };
            this.musicStarted = false;
            window.addEventListener('click', () => this.startMusic());
        }

        resize(width, height) {
            this.width = width;
            this.height = height;
        }

        startMusic() {
            if (!this.musicStarted) {
                this.sounds.theme.loop = true;
                this.sounds.theme.volume = 0.3;
                this.sounds.theme.play().catch(e => console.error("Audio play failed:", e));
                this.musicStarted = true;
            }
        }

        playSound(soundName) {
            const sound = this.sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play();
            }
        }

        update(deltaTime) {
            if (this.screenFlashTimer > 0) this.screenFlashTimer -= deltaTime;
            if (this.gameOver) return;

            this.noDropTimer += deltaTime;
            this.regenerateProbabilities(deltaTime);

            this.background.update();
            this.player.update(deltaTime);

            this.powerUps.forEach(p => {
                p.update();
                if (checkCollision(this.player, p)) { p.applyEffect(); p.markedForDeletion = true; }
            });
            this.powerUps = this.powerUps.filter(p => !p.markedForDeletion);

            if (this.gameState === 'playing') {
                if (this.enemyTimer > this.enemyInterval && this.enemies.length < this.maxEnemies) {
                    this.addEnemy(); this.enemyTimer = 0;
                } else { this.enemyTimer += deltaTime; }
                
                if (this.obstacleTimer > this.obstacleInterval && this.obstacles.length < this.maxObstacles) {
                    this.addObstacle(); this.obstacleTimer = 0;
                } else { this.obstacleTimer += deltaTime; }

                this.enemies.forEach(enemy => {
                    enemy.update(deltaTime);
                    if (checkCollision(this.player, enemy)) {
                        if (!this.player.shieldActive) this.triggerHit();
                        enemy.markedForDeletion = true;
                    }
                    this.player.projectiles.forEach(projectile => {
                        if (checkCollision(projectile, enemy)) {
                            let damage = (projectile instanceof LaserBeam) ? projectile.damage : this.player.damage;
                            enemy.lives -= damage;
                            if (!(projectile instanceof LaserBeam)) projectile.markedForDeletion = true;
                            if (enemy.lives <= 0) {
                                if (!enemy.markedForDeletion) {
                                    enemy.markedForDeletion = true; this.score += enemy.score;
                                    this.maxEnemies = Math.min(5, Math.floor(this.score / 15) + 1);
                                    this.maxObstacles = Math.min(3, Math.floor(this.score / 50)); // Новая формула
                                    this.tryDropPowerUp(enemy.x, enemy.y);
                                }
                                if (this.score >= this.winningScore && !this.boss) {
                                    this.gameState = 'boss_intro'; this.speed = 0; this.enemies = []; this.obstacles = []; this.powerUps = [];
                                    this.boss = new Boss(this);
                                }
                            }
                        }
                    });
                });
                this.enemies = this.enemies.filter(e => !e.markedForDeletion);

                this.obstacles.forEach(obstacle => {
                    obstacle.update();
                    if (checkCollision(this.player, obstacle)) {
                        if (!this.player.shieldActive) this.triggerHit(2);
                        obstacle.markedForDeletion = true;
                    }
                    this.player.projectiles.forEach(p => { if (checkCollision(p, obstacle)) p.markedForDeletion = true; });
                    this.enemyProjectiles.forEach(p => { if (checkCollision(p, obstacle)) p.markedForDeletion = true; });
                });
                this.obstacles = this.obstacles.filter(o => !o.markedForDeletion);

            } else if (this.gameState === 'boss_intro' || this.gameState === 'boss_battle') {
                if (this.boss) {
                    this.boss.update(deltaTime);
                    if (checkCollision(this.player, this.boss)) {
                        if (!this.player.shieldActive) this.triggerHit(this.player.lives);
                    }
                    this.player.projectiles.forEach(projectile => {
                        if (checkCollision(projectile, this.boss)) {
                            let damage = (projectile instanceof LaserBeam) ? projectile.damage : this.player.damage;
                            this.boss.lives -= damage;
                            if (!(projectile instanceof LaserBeam)) projectile.markedForDeletion = true;
                            if (this.boss.lives <= 0) {
                                this.boss.markedForDeletion = true; this.score += this.boss.score; this.gameOver = true;
                            }
                        }
                    });
                }
            }
            
            this.enemyProjectiles.forEach(p => {
                p.update();
                if (checkCollision(p, this.player)) {
                    if (!this.player.shieldActive) this.triggerHit();
                    p.markedForDeletion = true;
                }
            });
            this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion);

            if (this.player.lives <= 0) {
                if (!this.gameOver) {
                    this.gameOver = true;
                    this.sounds.theme.pause();
                    this.playSound('gameOver');
                }
            }
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => enemy.draw(context));
            this.obstacles.forEach(obstacle => obstacle.draw(context));
            this.enemyProjectiles.forEach(p => p.draw(context));
            this.powerUps.forEach(p => p.draw(context));
            if (this.boss) this.boss.draw(context);
            this.ui.draw(context);
            if (this.screenFlashTimer > 0) {
                context.fillStyle = this.screenFlashColor;
                context.fillRect(0, 0, this.width, this.height);
            }
        }
        
        triggerHit(damage = 1) {
            if (this.player.lives > 0) {
                this.player.lives -= damage;
                this.playSound('fail');
                this.triggerScreenFlash('rgba(255, 0, 0, 0.2)', 150);
            }
        }

        triggerScreenFlash(color, duration) {
            this.screenFlashColor = color;
            this.screenFlashTimer = duration;
        }

        tryDropPowerUp(x, y) {
            const dropChance = this.baseDropChance + (this.noDropTimer / 1000) * 0.02;
            if (Math.random() < dropChance) {
                this.noDropTimer = 0;
                const totalWeight = Object.values(this.powerUpProbabilities).reduce((a, b) => a + b, 0);
                let random = Math.random() * totalWeight;
                let selectedBonus = null;

                for (const key in this.powerUpProbabilities) {
                    random -= this.powerUpProbabilities[key];
                    if (random <= 0) {
                        selectedBonus = key;
                        break;
                    }
                }

                switch (selectedBonus) {
                    case 'heart': this.powerUps.push(new Heart(this, x, y)); break;
                    case 'nuke': this.powerUps.push(new Nuke(this, x, y)); break;
                    case 'damageBoost': this.powerUps.push(new DamageBoost(this, x, y)); break;
                    case 'weaponBonus': this.powerUps.push(new WeaponBonus(this, x, y)); break;
                    case 'ammoBonus': this.powerUps.push(new AmmoBonus(this, x, y)); break;
                    case 'shieldBonus': this.powerUps.push(new ShieldBonus(this, x, y)); break;
                }

                const droppedWeight = this.powerUpProbabilities[selectedBonus];
                const reductionFactor = 0.9;
                const reducedAmount = droppedWeight * reductionFactor;
                this.powerUpProbabilities[selectedBonus] -= reducedAmount;

                const otherBonusesCount = Object.keys(this.powerUpProbabilities).length - 1;
                const increaseAmount = reducedAmount / otherBonusesCount;
                for (const key in this.powerUpProbabilities) {
                    if (key !== selectedBonus) {
                        this.powerUpProbabilities[key] += increaseAmount;
                    }
                }
            }
        }

        regenerateProbabilities(deltaTime) {
            const regenRate = 0.01;
            for (const key in this.powerUpProbabilities) {
                if (this.powerUpProbabilities[key] < this.basePowerUpProbabilities[key]) {
                    this.powerUpProbabilities[key] += (regenRate * deltaTime) / 1000;
                } else if (this.powerUpProbabilities[key] > this.basePowerUpProbabilities[key]) {
                    this.powerUpProbabilities[key] -= (regenRate * deltaTime) / 1000;
                }
            }
        }

        addEnemy() {
            if (this.enemies.length < this.maxEnemies) {
                if (Math.random() < 0.5) {
                    this.enemies.push(new Angler1(this));
                } else {
                    this.enemies.push(new Angler2(this));
                }
            }
        }
        addObstacle() {
            this.obstacles.push(new Obstacle(this));
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    window.addEventListener('resize', e => {
        canvas.width = e.currentTarget.innerWidth;
        canvas.height = e.currentTarget.innerHeight;
        game.resize(canvas.width, canvas.height);
    });

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});