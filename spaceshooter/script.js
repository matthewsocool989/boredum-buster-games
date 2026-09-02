const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 60,
    height: 60,
    speed: 7,
    alive: true,
    health: 10,
    gunLevel: 1 // now goes up to 7
};

// Bullets
let bullets = [];
let enemyBullets = [];

// Health cubes
let healthCubes = [];

// Lightning auto-attack
let killCount = 0;
let lightningTimer = 0;

// Sounds
let lightningSound = new Audio("lightning.wav");
let explosionSound = new Audio("explosion.wav");

// Enemies
let enemies = [];

// Background objects
let backgroundObjects = [];

// Difficulty scaling
let difficulty = {
    time: 0,
    baseSpeed: 1.5,
    spawnInterval: 1000,
    lastSpawn: 0
};

// Points + kills
let points = 0;
let totalKills = 0;

// Victory flag
let gameWon = false;

// Fireworks particles (victory)
let fireworks = [];

// Explosions (enemy deaths)
let explosions = [];

// Play Again button
const playAgainBtn = document.getElementById("playAgainBtn");
playAgainBtn.onclick = () => location.reload();

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Continuous fire
setInterval(() => {
    if (player.alive && !gameWon) fireBullets();
}, 200);

// Fire bullets based on gun level (1–7)
function fireBullets() {
    const x = player.x;
    const y = player.y - 20;

    const patterns = {
        1: [0],
        2: [-20, 20],
        3: [0, -25, 25],
        4: [0, -30, 30, -15, 15],
        5: [0, -35, 35, -20, 20, -10, 10],
        6: [0, -40, 40, -25, 25, -15, 15, -5, 5],
        7: [0, -45, 45, -30, 30, -20, 20, -10, 10]
    };

    const offsets = patterns[player.gunLevel] || patterns[1];

    offsets.forEach(offset => {
        bullets.push({
            x: x + offset,
            y,
            width: 6,
            height: 14,
            speed: 12
        });
    });
}

// Spawn enemies (speed increases over time)
function spawnEnemy() {
    const speedBoost = difficulty.time * 0.08; // stronger scaling
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        alive: true,
        speed: difficulty.baseSpeed + speedBoost,
        shootChance: 0.002,   // slower shooters
        bulletSpeed: 4        // slower bullet travel
    });
}

// Background objects
function spawnBackgroundObject() {
    const types = ["planet", "asteroid", "monster", "nebula"];
    const type = types[Math.floor(Math.random() * types.length)];
    backgroundObjects.push({
        x: Math.random() * canvas.width,
        y: -200,
        type,
        speed: 0.5 + Math.random() * 1.5,
        size: 40 + Math.random() * 80
    });
}

// Fireworks (victory)
function spawnFirework() {
    for (let i = 0; i < 40; i++) {
        fireworks.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            life: 60,
            color: `hsl(${Math.random() * 360}, 100%, 60%)`
        });
    }
}

// Explosions (enemy death) — RED
function spawnExplosion(x, y) {
    explosionSound.currentTime = 0;
    explosionSound.play();

    for (let i = 0; i < 25; i++) {
        explosions.push({
            x,
            y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            life: 30,
            color: "red"
        });
    }
}

// Game loop
let lastTime = performance.now();
function update(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    difficulty.time += delta / 1000;

    if (gameWon) {
        // Victory mode: fireworks + lingering explosions
        spawnFirework();

        fireworks.forEach(f => {
            f.x += f.dx;
            f.y += f.dy;
            f.life--;
        });
        fireworks = fireworks.filter(f => f.life > 0);

        explosions.forEach(ex => {
            ex.x += ex.dx;
            ex.y += ex.dy;
            ex.life--;
        });
        explosions = explosions.filter(ex => ex.life > 0);

        draw();
        return;
    }

    if (!player.alive) {
        draw();
        return;
    }

    // Movement
    if (keys["a"] && player.x - player.width / 2 > 0) player.x -= player.speed;
    if (keys["d"] && player.x + player.width / 2 < canvas.width) player.x += player.speed;
    if (keys["w"] && player.y - player.height / 2 > 0) player.y -= player.speed;
    if (keys["s"] && player.y + player.height / 2 < canvas.height) player.y += player.speed;

    // Spawn enemies
    if (timestamp - difficulty.lastSpawn > difficulty.spawnInterval) {
        spawnEnemy();
        difficulty.lastSpawn = timestamp;
        if (difficulty.spawnInterval > 400) difficulty.spawnInterval -= 10;
    }

    // Background objects
    if (Math.random() < 0.01) spawnBackgroundObject();

    // Move bullets
    bullets.forEach(b => b.y -= b.speed);

    // Move enemy bullets
    enemyBullets.forEach(b => b.y += b.speed);

    // Move enemies
    enemies.forEach(e => {
        if (e.alive) {
            e.y += e.speed;

            if (Math.random() < e.shootChance) {
                enemyBullets.push({
                    x: e.x,
                    y: e.y + e.height / 2,
                    width: 6,
                    height: 14,
                    speed: e.bulletSpeed
                });
            }
        }
    });

    // Move background objects
    backgroundObjects.forEach(o => o.y += o.speed);

    // Move health cubes
    healthCubes.forEach(c => c.y += 3);

    // Move explosions
    explosions.forEach(ex => {
        ex.x += ex.dx;
        ex.y += ex.dy;
        ex.life--;
    });
    explosions = explosions.filter(ex => ex.life > 0);

    // Bullet collision with enemies
    bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.alive &&
                b.x < e.x + e.width / 2 &&
                b.x + b.width > e.x - e.width / 2 &&
                b.y < e.y + e.height / 2 &&
                b.y + b.height > e.y - e.height / 2) {

                e.alive = false;
                b.y = -999;

                spawnExplosion(e.x, e.y);

                killCount++;
                totalKills++;
                points += 100;

                // Victory at 10,000 points
                if (points >= 10000) {
                    gameWon = true;
                    player.alive = false;
                    playAgainBtn.style.display = "block";
                }

                // Drop health cube
                if (Math.random() < 0.3) {
                    healthCubes.push({
                        x: e.x,
                        y: e.y,
                        width: 20,
                        height: 20
                    });
                }

                // Gun upgrade every 10 kills
                if (totalKills % 10 === 0) {
                    player.gunLevel++;
                    if (player.gunLevel > 7) player.gunLevel = 7;
                }

                // Lightning every 5 kills
                if (killCount >= 5) {
                    killCount = 0;
                    lightningTimer = 20;
                    lightningSound.currentTime = 0;
                    lightningSound.play();

                    enemies.forEach(enemy => {
                        if (enemy.alive) enemy.alive = false;
                    });
                }
            }
        });
    });

    // Enemy bullet collision
    enemyBullets.forEach(b => {
        if (b.x < player.x + player.width / 2 &&
            b.x + b.width > player.x - player.width / 2 &&
            b.y < player.y + player.height / 2 &&
            b.y + b.height > player.y - player.height / 2) {

            player.health -= 1;

            // Lose gun level + reset position
            player.gunLevel--;
            if (player.gunLevel < 1) player.gunLevel = 1;
            player.x = canvas.width / 2;
            player.y = canvas.height - 150;

            b.y = canvas.height + 100;

            if (player.health <= 0) player.alive = false;
        }
    });

    // Health cube pickup
    healthCubes.forEach(c => {
        if (c.x < player.x + player.width / 2 &&
            c.x + c.width > player.x - player.width / 2 &&
            c.y < player.y + player.height / 2 &&
            c.y + c.height > player.y - player.height / 2) {

            player.health += 2;
            if (player.health > 10) player.health = 10;

            c.y = canvas.height + 100;
        }
    });

    draw();
    requestAnimationFrame(update);
}

// Draw player ship with style changes per gun level
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;

    ctx.save();
    ctx.translate(x, y);

    // Base navy body
    ctx.fillStyle = "#0a1a3a";
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 3, -h / 4);
    ctx.lineTo(w / 2, h / 4);
    ctx.lineTo(0, h / 2);
    ctx.lineTo(-w / 2, h / 4);
    ctx.lineTo(-w / 3, -h / 4);
    ctx.closePath();
    ctx.fill();

    // Trim changes with gun level
    const trims = [
        "#0f3b6f",
        "#1a5b8f",
        "#2a7bbf",
        "#3a9bef",
        "#4acbff",
        "#5afcff",
        "#7affff"
    ];
    const trimColor = trims[Math.min(player.gunLevel - 1, trims.length - 1)];
    ctx.fillStyle = trimColor;

    ctx.beginPath();
    ctx.moveTo(0, -h / 2 + 6);
    ctx.lineTo(w / 4, -h / 6);
    ctx.lineTo(w / 3, h / 6);
    ctx.lineTo(0, h / 2 - 6);
    ctx.lineTo(-w / 3, h / 6);
    ctx.lineTo(-w / 4, -h / 6);
    ctx.closePath();
    ctx.fill();

    // Cockpit becomes brighter with upgrades
    const cockpitColors = [
        "#00eaff",
        "#33f0ff",
        "#66f6ff",
        "#99fbff",
        "#ccffff",
        "#e0ffff",
        "#ffffff"
    ];
    const cockpitColor = cockpitColors[Math.min(player.gunLevel - 1, cockpitColors.length - 1)];
    ctx.fillStyle = cockpitColor;

    ctx.beginPath();
    ctx.moveTo(-w / 8, -h / 6);
    ctx.lineTo(w / 8, -h / 6);
    ctx.lineTo(w / 6, 0);
    ctx.lineTo(-w / 6, 0);
    ctx.closePath();
    ctx.fill();

    // Cannons increase with gun level
    ctx.fillStyle = cockpitColor;

    const baseCannons = [-w / 3 - 4, w / 3 - 2];
    baseCannons.forEach(offset => {
        ctx.fillRect(offset, -h / 2, 6, h / 4);
    });

    if (player.gunLevel >= 4) ctx.fillRect(-10, -h / 2, 6, h / 4);
    if (player.gunLevel >= 5) ctx.fillRect(10, -h / 2, 6, h / 4);
    if (player.gunLevel >= 6) ctx.fillRect(-20, -h / 2, 6, h / 4);
    if (player.gunLevel >= 7) ctx.fillRect(20, -h / 2, 6, h / 4);

    ctx.restore();
}

// Draw enemy
function drawEnemy(e) {
    ctx.save();
    ctx.translate(e.x, e.y);

    const w = e.width;
    const h = e.height;

    ctx.fillStyle = "#3b0f6f";
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, -h / 4);
    ctx.lineTo(w / 3, h / 2);
    ctx.lineTo(-w / 3, h / 2);
    ctx.lineTo(-w / 2, -h / 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ff0066";
    ctx.beginPath();
    ctx.arc(0, 0, h / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Background objects
function drawBackgroundObject(o) {
    ctx.save();
    ctx.translate(o.x, o.y);

    switch (o.type) {
        case "planet":
            ctx.fillStyle = "#223366";
            ctx.beginPath();
            ctx.arc(0, 0, o.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case "asteroid":
            ctx.fillStyle = "#555555";
            ctx.beginPath();
            ctx.moveTo(-o.size / 3, -o.size / 4);
            ctx.lineTo(o.size / 4, -o.size / 3);
            ctx.lineTo(o.size / 3, o.size / 5);
            ctx.lineTo(-o.size / 4, o.size / 3);
            ctx.closePath();
            ctx.fill();
            break;
        case "monster":
            ctx.fillStyle = "#330022";
            ctx.beginPath();
            ctx.arc(0, 0, o.size / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        case "nebula":
            ctx.fillStyle = "rgba(0, 150, 255, 0.2)";
            ctx.beginPath();
            ctx.arc(0, 0, o.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    ctx.restore();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lightning flash
    if (lightningTimer > 0) {
        ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Background objects
    backgroundObjects.forEach(o => drawBackgroundObject(o));

    // Lightning bolts
    if (lightningTimer > 0) {
        ctx.strokeStyle = "#00eaff";
        ctx.lineWidth = 4;

        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(
                player.x + (Math.random() * 600 - 300),
                player.y - (Math.random() * 400)
            );
            ctx.stroke();
        }

        lightningTimer--;
    }

    // Explosions (red)
    explosions.forEach(ex => {
        ctx.fillStyle = ex.color;
        ctx.fillRect(ex.x, ex.y, 4, 4);
    });

    // Victory screen
    if (gameWon) {
        ctx.fillStyle = "white";
        ctx.font = "80px Arial";
        ctx.fillText("VICTORY!", canvas.width / 2 - 200, canvas.height / 2 - 40);

        fireworks.forEach(f => {
            ctx.fillStyle = f.color;
            ctx.fillRect(f.x, f.y, 4, 4);
        });

        return;
    }

    // Player
    if (player.alive) {
        drawPlayer();
    } else {
        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.fillText("YOU DIED", canvas.width / 2 - 150, canvas.height / 2);
        return;
    }

    // Bullets
    ctx.fillStyle = "#ffff66";
    bullets.forEach(b => ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height));

    // Enemy bullets
    ctx.fillStyle = "#ff4444";
    enemyBullets.forEach(b => ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height));

    // Enemies
    enemies.forEach(e => {
        if (e.alive) drawEnemy(e);
    });

    // Health cubes
    ctx.fillStyle = "#00ff00";
    healthCubes.forEach(c => ctx.fillRect(c.x - c.width / 2, c.y - c.height / 2, c.width, c.height));

    // Health bar
    ctx.fillStyle = "red";
    ctx.fillRect(20, canvas.height - 40, 200, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, canvas.height - 40, 20 * player.health, 20);

    // Points + gun level display
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Points: " + points, 20, 40);
    ctx.fillText("Gun Level: " + player.gunLevel, 20, 70);
}

requestAnimationFrame(update);
