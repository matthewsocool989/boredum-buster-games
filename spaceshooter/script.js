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
    alive: true,
    health: 3,
    shield: false,
    shieldTimer: 0
};

// Bullets
let bullets = [];
let enemyBullets = [];

// Power-ups
let powerUps = [];

// Special attack
let specialReady = true;

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

// Special attack (Shift)
document.addEventListener("keydown", e => {
    if (e.key === "Shift" && specialReady) {
        specialReady = false;

        enemies.forEach(e => {
            if (e.alive) e.alive = false;
        });

        setTimeout(() => specialReady = true, 5000);
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

    // Spawn power-ups
    if (Math.random() < 0.005) {
        powerUps.push({
            x: Math.random() * canvas.width,
            y: -20,
            width: 20,
            height: 20,
            type: "shield"
        });
    }

    // Move power-ups
    powerUps.forEach(p => p.y += 3);

    // Bullet collision with enemies
    bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.alive &&
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                e.alive = false;
                b.y = -999;
            }
        });
    });

    // Enemy bullet collision with player
    enemyBullets.forEach(b => {
        if (b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y) {

            if (!player.shield) {
                player.health--;
            }

            b.y = canvas.height + 100;

            if (player.health <= 0) {
                player.alive = false;
            }
        }
    });

    // Power-up pickup
    powerUps.forEach(p => {
        if (p.x < player.x + player.width &&
            p.x + p.width > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height > player.y) {

            if (p.type === "shield") {
                player.shield = true;
                player.shieldTimer = 300;
            }

            p.y = canvas.height + 100;
        }
    });

    // Shield timer
    if (player.shield) {
        player.shieldTimer--;
        if (player.shieldTimer <= 0) player.shield = false;
    }

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

        if (player.shield) {
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 4;
            ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
        }
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

    // Power-ups
    ctx.fillStyle = "cyan";
    powerUps.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Health bar
    ctx.fillStyle = "red";
    ctx.fillRect(20, canvas.height - 40, 150, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, canvas.height - 40, 50 * player.health, 20);

    // Special attack indicator
    ctx.fillStyle = specialReady ? "cyan" : "gray";
    ctx.fillRect(canvas.width - 120, canvas.height - 40, 100, 20);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("SPECIAL", canvas.width - 110, canvas.height - 25);
}

update();
