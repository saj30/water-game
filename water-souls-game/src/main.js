import { Player } from './player.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Player setup (centered)
let player = new Player(
    canvas.width / 2 - 20,
    canvas.height / 2 - 20
);

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Main loop
function gameLoop() {
    player.update(keys, canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();