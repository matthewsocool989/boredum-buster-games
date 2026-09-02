const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 7,
    alive: true
};

// Bullets
let bullets = [];
let enemyBullets = [];

// Enemies
let enemies = [];
const enemyRows = 3;
const enemyCols = 8;

// Create enemies
for (let r = 0; r < enemyRows; r++) {
    for (let c = 0; c < enemyCols; c++) {
        enemies.push({
            x: 100 + c * 100,
            y: 50 + r * 80,
            width: 40,
            height: 40,
            alive: true
        });
    }
}

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Shoot
document.addEventListener("keydown", e => {
    if (e.key === " ") {
        bullets.push({
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 5,
            height: 10
        });
    }
});

// Game loop
function update() {
    if (!player.alive) return;

    // Move player
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

    // Move bullets
    bullets.forEach(b => b.y -= 10);

    // Move enemy bullets
    enemyBullets.forEach(b => b.y += 6);

    // Enemy shooting
    if (Math.random() < 0.02) {
        let shooter = enemies[Math.floor(Math.random() * enemies.length)];
        if (shooter && shooter.alive) {
            enemyBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height,
                width: 5,
                height: 10
            });
        }
    }

    // Bullet collision with enemies
    bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.alive &&
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                e.alive = false;
                b.y = -999; // remove bullet
            }
        });
    });

    // Enemy bullet collision with player
    enemyBullets.forEach(b => {
        if (b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y) {
            player.alive = false;
        }
    });

    draw();
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    if (player.alive) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.fillText("YOU DIED", canvas.width / 2 - 150, canvas.height / 2);
        return;
    }

    // Bullets
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Enemy bullets
    ctx.fillStyle = "red";
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Enemies
    ctx.fillStyle = "lime";
    enemies.forEach(e => {
        if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
    });
}

update();
