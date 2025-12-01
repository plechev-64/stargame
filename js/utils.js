export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        window.addEventListener('keydown', e => {
            this.game.startMusic();
            const key = e.key;
            if ((key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight' || key === ' ') && this.keys.indexOf(key) === -1) {
                this.keys.push(key);
            } else if (key === 'c') {
                this.game.player.callSupport();
            }
        });
        window.addEventListener('keyup', e => {
            if (this.keys.indexOf(e.key) > -1) this.keys.splice(this.keys.indexOf(e.key), 1);
        });
    }
}

export function checkCollision(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    if (obj1.radius && obj2.width) { // obj1 is circle, obj2 is rect
        const circle = obj1;
        const rect = obj2;
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (circle.radius * circle.radius);
    }
    if (obj1.width && obj2.radius) { // obj1 is rect, obj2 is circle
        return checkCollision(obj2, obj1); // Reverse order
    }
    // Rect-Rect collision (default)
    return ( obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.height + obj1.y > obj2.y )
}