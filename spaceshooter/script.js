const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player (medium fighter)
const player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 60,
    height: 60,
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

// Background objects
let backgroundObjects = [];

// Difficulty scaling
let difficulty = {
    time: 0,
    baseSpeed: 1.5,
    spawnInterval: 1000,
    lastSpawn: 0
};

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Shoot
document.addEventListener("keydown", e => {
    if (e.key === " ") {
        bullets.push({
            x: player.x,
            y: player.y - 10,
            width: 6,
            height: 14,
            speed: 12
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

// Spawn enemies based on difficulty
function spawnEnemy() {
    const speedBoost = difficulty.time * 0.02;
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        alive: true,
        speed: difficulty.baseSpeed + speedBoost,
        shootChance: 0.005 + difficulty.time * 0.0005
    });
}

// Spawn background objects
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

// Game loop
let lastTime = performance.now();
function update(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    difficulty.time += delta / 1000;

    if (!player.alive) {
        draw();
        return;
    }

    // WASD movement
    if (keys["a"] && player.x - player.width / 2 > 0) player.x -= player.speed;
    if (keys["d"] && player.x + player.width / 2 < canvas.width) player.x += player.speed;
    if (keys["w"] && player.y - player.height / 2 > 0) player.y -= player.speed;
    if (keys["s"] && player.y + player.height / 2 < canvas.height) player.y += player.speed;

    // Spawn enemies over time
    if (timestamp - difficulty.lastSpawn > difficulty.spawnInterval) {
        spawnEnemy();
        difficulty.lastSpawn = timestamp;
        if (difficulty.spawnInterval > 400) difficulty.spawnInterval -= 10; // faster spawns over time
    }

    // Occasionally spawn background objects
    if (Math.random() < 0.01) {
        spawnBackgroundObject();
    }

    // Move bullets
    bullets.forEach(b => b.y -= b.speed);

    // Move enemy bullets
    enemyBullets.forEach(b => b.y += b.speed);

    // Move enemies
    enemies.forEach(e => {
        if (e.alive) {
            e.y += e.speed;

            // Enemy shooting
            if (Math.random() < e.shootChance) {
                enemyBullets.push({
                    x: e.x,
                    y: e.y + e.height / 2,
                    width: 6,
                    height: 14,
                    speed: 7
                });
            }
        }
    });

    // Move background objects
    backgroundObjects.forEach(o => {
        o.y += o.speed;
    });

    // Spawn power-ups
    if (Math.random() < 0.004) {
        powerUps.push({
            x: Math.random() * canvas.width,
            y: -20,
            width: 24,
            height: 24,
            type: "shield",
            speed: 3
        });
    }

    // Move power-ups
    powerUps.forEach(p => p.y += p.speed);

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
            }
        });
    });

    // Enemy bullet collision with player
    enemyBullets.forEach(b => {
        if (b.x < player.x + player.width / 2 &&
            b.x + b.width > player.x - player.width / 2 &&
            b.y < player.y + player.height / 2 &&
            b.y + b.height > player.y - player.height / 2) {

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
        if (p.x < player.x + player.width / 2 &&
            p.x + p.width > player.x - player.width / 2 &&
            p.y < player.y + player.height / 2 &&
            p.y + p.height > player.y - player.height / 2) {

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

// Draw player ship (angular twin-engine)
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;

    // Body
    ctx.save();
    ctx.translate(x, y);

    // Main fuselage
    ctx.fillStyle = "#0a1a3a"; // deep navy
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);              // nose
    ctx.lineTo(w / 3, -h / 4);
    ctx.lineTo(w / 2, h / 4);
    ctx.lineTo(0, h / 2);
    ctx.lineTo(-w / 2, h / 4);
    ctx.lineTo(-w / 3, -h / 4);
    ctx.closePath();
    ctx.fill();

    // Trim
    ctx.fillStyle = "#0f3b6f";
    ctx.beginPath();
    ctx.moveTo(0, -h / 2 + 6);
    ctx.lineTo(w / 4, -h / 6);
    ctx.lineTo(w / 3, h / 6);
    ctx.lineTo(0, h / 2 - 6);
    ctx.lineTo(-w / 3, h / 6);
    ctx.lineTo(-w / 4, -h / 6);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#00eaff";
    ctx.beginPath();
    ctx.moveTo(-w / 8, -h / 6);
    ctx.lineTo(w / 8, -h / 6);
    ctx.lineTo(w / 6, 0);
    ctx.lineTo(-w / 6, 0);
    ctx.closePath();
    ctx.fill();

    // Twin forward cannons
    ctx.fillStyle = "#00eaff";
    ctx.fillRect(-w / 3 - 4, -h / 2, 6, h / 4);
    ctx.fillRect(w / 3 - 2, -h / 2, 6, h / 4);

    // Rear engines
    ctx.fillStyle = "#00eaff";
    ctx.beginPath();
    ctx.moveTo(-w / 3, h / 2);
    ctx.lineTo(-w / 4, h / 2 + 10);
    ctx.lineTo(-w / 5, h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w / 3, h / 2);
    ctx.lineTo(w / 4, h / 2 + 10);
    ctx.lineTo(w / 5, h / 2);
    ctx.closePath();
    ctx.fill();

    // Shield outline
    if (player.shield) {
        ctx.strokeStyle = "#00eaff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 - 8);
        ctx.lineTo(w / 2 + 8, 0);
        ctx.lineTo(0, h / 2 + 8);
        ctx.lineTo(-w / 2 - 8, 0);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

// Draw enemy (angular alien)
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

    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 4);
    ctx.lineTo(-w / 3, h / 2);
    ctx.moveTo(w / 2, -h / 4);
    ctx.lineTo(w / 3, h / 2);
    ctx.stroke();

    ctx.restore();
}

// Draw background objects
function drawBackgroundObject(o) {
    ctx.save();
    ctx.translate(o.x, o.y);

    switch (o.type) {
        case "planet":
            ctx.fillStyle = "#223366";
            ctx.beginPath();
            ctx.arc(0, 0, o.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#00eaff";
            ctx.beginPath();
            ctx.arc(0, 0, o.size / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();
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
            ctx.fillStyle = "#ff0000";
            ctx.beginPath();
            ctx.arc(-o.size / 8, -o.size / 10, o.size / 12, 0, Math.PI * 2);
            ctx.arc(o.size / 8, -o.size / 10, o.size / 12, 0, Math.PI * 2);
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

    // Background objects
    backgroundObjects.forEach(o => drawBackgroundObject(o));

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

    // Power-ups
    ctx.fillStyle = "#00eaff";
    powerUps.forEach(p => ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height));

    // Health bar
    ctx.fillStyle = "red";
    ctx.fillRect(20, canvas.height - 40, 150, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, canvas.height - 40, 50 * player.health, 20);

    // Special attack indicator
    ctx.fillStyle = specialReady ? "#00eaff" : "gray";
    ctx.fillRect(canvas.width - 140, canvas.height - 40, 120, 20);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("SPECIAL", canvas.width - 120, canvas.height - 25);
}

requestAnimationFrame(update);
