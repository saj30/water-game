class Enemy {
    constructor(x, y, health, damage) {
        this.x = x;
        this.y = y;
        this.health = health;
        this.damage = damage;
        this.alive = true;
    }

    move() {
        // Logic for enemy movement
        // This could include simple AI behavior
    }

    attack(player) {
        // Logic for attacking the player
        // This could include checking if in range and applying damage
        if (this.alive) {
            player.takeDamage(this.damage);
        }
    }

    draw(context) {
        // Logic for drawing the enemy on the canvas
        context.fillStyle = 'red'; // Example color for the enemy
        context.fillRect(this.x, this.y, 50, 50); // Example size for the enemy
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
        }
    }
}

export default Enemy;