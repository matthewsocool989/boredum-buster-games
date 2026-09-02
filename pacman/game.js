const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const TILE = 20;
const ROWS = 31;
const COLS = 28;

let score = 0;
let gameOver = false;
let powerMode = false;
let powerTimer = 0;

// 0 = empty
// 1 = wall
// 2 = pellet
// 3 = power pellet
// Player and ghosts spawn separately

const map = [
    "1111111111111111111111111111",
    "1222222222221111222222222221",
    "1211112111121111211112111121",
    "1311112111121111211112111131",
    "1211112111121111211112111121",
    "1222222222222222222222222221",
    "1211112111111111111112111121",
    "1222222112221111221122222221",
    "1111112112221111221121111111",
    "0000012112220000221121000000",
    "1111112111110000111121111111",
    "0000002110000000001120000000",
    "1111112110001110001121111111",
    "0000002110001110001120000000",
    "1111112111111111111121111111",
    "1222222222221111222222222221",
    "1211112111121111211112111121",
    "1311112111121111211112111131",
    "1211112111121111211112111121",
    "1222222222222222222222222221",
    "1211112111111111111112111121",
    "1222222112221111221122222221",
    "1111112112221111221121111111",
    "0000012112220000221121000000",
    "1111112111110000111121111111",
    "0000002110000000001120000000",
    "1111112110001110001121111111",
    "0000002110001110001120000000",
    "1111112111111111111121111111",
    "1222222222222222222222222221",
    "1111111111111111111111111111"
];

function tileAt(r, c) {
    return parseInt(map[r][c]);
}

function setTile(r, c, val) {
    map[r] = map[r].substring(0, c) + val + map[r].substring(c + 1);
}

const player = {
    r: 23,
    c: 13,
    dr: 0,
    dc: 0,
    nextDr: 0,
    nextDc: 0
};

const ghosts = [
    { r: 14, c: 13, color: "red", dr: 0, dc: 1 },
    { r: 14, c: 14, color: "pink", dr: 0, dc: -1 },
    { r: 15, c: 13, color: "cyan", dr: 1, dc: 0 },
    { r: 15, c: 14, color: "orange", dr: -1, dc: 0 }
];

function canMove(r, c) {
    return tileAt(r, c) !== 1;
}

function updatePlayer() {
    if (canMove(player.r + player.nextDr, player.c + player.nextDc)) {
        player.dr = player.nextDr;
        player.dc = player.nextDc;
    }

    if (canMove(player.r + player.dr, player.c + player.dc)) {
        player.r += player.dr;
        player.c += player.dc;
    }

    const tile = tileAt(player.r, player.c);

    if (tile === 2) {
        score += 10;
        setTile(player.r, player.c, 0);
    }

    if (tile === 3) {
        score += 50;
        powerMode = true;
        powerTimer = 600;
        setTile(player.r, player.c, 0);
    }
}

function updateGhosts() {
    ghosts.forEach(g => {
        let bestDr = 0;
        let bestDc = 0;
        let bestDist = Infinity;

        const dirs = [
            { dr: 1, dc: 0 },
            { dr: -1, dc: 0 },
            { dr: 0, dc: 1 },
            { dr: 0, dc: -1 }
        ];

        dirs.forEach(d => {
            const nr = g.r + d.dr;
            const nc = g.c + d.dc;

            if (!canMove(nr, nc)) return;

            const dist = Math.hypot(player.r - nr, player.c - nc);

            if (dist < bestDist) {
                bestDist = dist;
                bestDr = d.dr;
                bestDc = d.dc;
            }
        });

        g.r += bestDr;
        g.c += bestDc;

        if (g.r === player.r && g.c === player.c) {
            if (powerMode) {
                score += 200;
                g.r = 14;
                g.c = 13;
            } else {
                gameOver = true;
                statusEl.textContent = "You were caught!";
            }
        }
    });
}

function drawMap() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = tileAt(r, c);

            if (tile === 1) {
                ctx.fillStyle = "#0033ff";
                ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
            } else if (tile === 2) {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(c * TILE + 10, r * TILE + 10, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) {
                ctx.fillStyle = "#ff0";
                ctx.beginPath();
                ctx.arc(c * TILE + 10, r * TILE + 10, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = powerMode ? "#00ff88" : "#ffff00";
    ctx.beginPath();
    ctx.arc(player.c * TILE + 10, player.r * TILE + 10, 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(g => {
        ctx.fillStyle = powerMode ? "#4444ff" : g.color;
        ctx.beginPath();
        ctx.arc(g.c * TILE + 10, g.r * TILE + 10, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

function update() {
    if (gameOver) return;

    updatePlayer();
    updateGhosts();

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
        }
    }

    scoreEl.textContent = `Score: ${score}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    drawGhosts();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") player.nextDr = -1, player.nextDc = 0;
    if (e.key === "ArrowDown") player.nextDr = 1, player.nextDc = 0;
    if (e.key === "ArrowLeft") player.nextDr = 0, player.nextDc = -1;
    if (e.key === "ArrowRight") player.nextDr = 0, player.nextDc = 1;
});

restartBtn.addEventListener("click", () => {
    location.reload();
});

loop();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const TILE = 20;
const ROWS = 31;
const COLS = 28;

let score = 0;
let gameOver = false;
let powerMode = false;
let powerTimer = 0;
let currentLevel = 0;

// GHOST HOUSE LOCATION (safe, walkable)
const GHOST_HOUSE_R = 14;
const GHOST_HOUSE_C = 13;

// PLAYER SPAWN
const PLAYER_SPAWN_R = 23;
const PLAYER_SPAWN_C = 13;

// 5 MAPS — guaranteed ghost house opening
const maps = [
[
"1111111111111111111111111111",
"1222222222221111222222222221",
"1211112111121111211112111121",
"1311112111121111211112111131",
"1211112111121111211112111121",
"1222222222222222222222222221",
"1211112111111111111112111121",
"1222222112221111221122222221",
"1111112112221111221121111111",
"0000012112220000221121000000",
"1111112111110000111121111111",
"0000002110000000001120000000",
"1111112110001110001121111111",
"0000002110001110001120000000",
"1111112111110111111121111111", // <-- ghost house opening
"1222222222221111222222222221",
"1211112111121111211112111121",
"1311112111121111211112111131",
"1211112111121111211112111121",
"1222222222222222222222222221",
"1211112111111111111112111121",
"1222222112221111221122222221",
"1111112112221111221121111111",
"0000012112220000221121000000",
"1111112111110000111121111111",
"0000002110000000001120000000",
"1111112110001110001121111111",
"0000002110001110001120000000",
"1111112111111111111121111111",
"1222222222222222222222222221",
"1111111111111111111111111111"
],
// MAP 2
[
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1212121212121112121212122121",
"1212121212121212121212122121",
"1222222222222222222222222221",
"1111111111110111111111111111", // ghost house opening
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1212121212121112121212122121",
"1212121212121212121212122121",
"1222222222222222222222222221",
"1111111111111111111111111111"
],
// MAP 3
[
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1212121212121112121212122121",
"1212121212121212121212122121",
"1222222222222222222222222221",
"1111111111110111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1222222222222222222222222221",
"1111111111111111111111111111"
],
// MAP 4
[
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1212121212121112121212122121",
"1212121212121212121212122121",
"1222222222222222222222222221",
"1111111111110111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1111111111111111111111111111"
],
// MAP 5
[
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1212121212222222222121212121",
"1212121212111111121212122121",
"1212121212122222121212122121",
"1212121212121112121212122121",
"1212121212121212121212122121",
"1222222222222222222222222221",
"1111111111110111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"0000000000000000000000000000",
"1111111111111111111111111111",
"1222222222222222222222222221",
"1211111111111111111111111121",
"1212222222222222222222222121",
"1212111111111111111111112121",
"1212122222222222222222222121",
"1212121111111111111111122121",
"1212121222222222222222122121",
"1212121211111111111121212121",
"1111111111111111111111111111"
]
];

let map = JSON.parse(JSON.stringify(maps[currentLevel]));

function tileAt(r, c) {
    return parseInt(map[r][c]);
}

function setTile(r, c, val) {
    map[r] = map[r].substring(0, c) + val + map[r].substring(c + 1);
}

const player = {
    r: PLAYER_SPAWN_R,
    c: PLAYER_SPAWN_C,
    dr: 0,
    dc: 0,
    nextDr: 0,
    nextDc: 0
};

const ghosts = [
    { r: GHOST_HOUSE_R, c: GHOST_HOUSE_C, color: "red", dr: 0, dc: 1 },
    { r: GHOST_HOUSE_R, c: GHOST_HOUSE_C + 1, color: "pink", dr: 0, dc: -1 },
    { r: GHOST_HOUSE_R + 1, c: GHOST_HOUSE_C, color: "cyan", dr: 1, dc: 0 },
    { r: GHOST_HOUSE_R + 1, c: GHOST_HOUSE_C + 1, color: "orange", dr: -1, dc: 0 }
];

function resetPositions() {
    player.r = PLAYER_SPAWN_R;
    player.c = PLAYER_SPAWN_C;
    player.dr = 0;
    player.dc = 0;
    player.nextDr = 0;
    player.nextDc = 0;

    ghosts.forEach((g, i) => {
        g.r = GHOST_HOUSE_R + (i > 1 ? 1 : 0);
        g.c = GHOST_HOUSE_C + (i % 2);
        g.dr = 0;
        g.dc = 0;
    });
}

function canMove(r, c) {
    return tileAt(r, c) !== 1;
}

function updatePlayer() {
    if (canMove(player.r + player.nextDr, player.c + player.nextDc)) {
        player.dr = player.nextDr;
        player.dc = player.nextDc;
    }

    if (canMove(player.r + player.dr, player.c + player.dc)) {
        player.r += player.dr;
        player.c += player.dc;
    }

    const tile = tileAt(player.r, player.c);

    if (tile === 2) {
        score += 10;
        setTile(player.r, player.c, 0);
    }

    if (tile === 3) {
        score += 50;
        powerMode = true;
        powerTimer = 600;
        setTile(player.r, player.c, 0);
    }
}

function updateGhosts() {
    ghosts.forEach(g => {
        const dirs = [
            { dr: 1, dc: 0 },
            { dr: -1, dc: 0 },
            { dr: 0, dc: 1 },
            { dr: 0, dc: -1 }
        ];

        // Find best direction
        let best = null;
        let bestDist = Infinity;

        dirs.forEach(d => {
            const nr = g.r + d.dr;
            const nc = g.c + d.dc;

            if (!canMove(nr, nc)) return;

            const dist = Math.hypot(player.r - nr, player.c - nc);

            if (dist < bestDist) {
                bestDist = dist;
                best = d;
            }
        });

        // Fallback: random movement if stuck
        if (!best) {
            best = dirs[Math.floor(Math.random() * dirs.length)];
            if (!canMove(g.r + best.dr, g.c + best.dc)) return;
        }

        g.r += best.dr;
        g.c += best.dc;

        // Collision
        if (g.r === player.r && g.c === player.c) {
            if (powerMode) {
                score += 200;
                g.r = GHOST_HOUSE_R;
                g.c = GHOST_HOUSE_C;
            } else {
                gameOver = true;
                statusEl.textContent = "You were caught!";
            }
        }
    });
}

function drawMap() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = tileAt(r, c);

            if (tile === 1) {
                ctx.fillStyle = "#0033ff";
                ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
            } else if (tile === 2) {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(c * TILE + 10, r * TILE + 10, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) {
                ctx.fillStyle = "#ff0";
                ctx.beginPath();
                ctx.arc(c * TILE + 10, r * TILE + 10, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = powerMode ? "#00ff88" : "#ffff00";
    ctx.beginPath();
    ctx.arc(player.c * TILE + 10, player.r * TILE + 10, 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(g => {
        ctx.fillStyle = powerMode ? "#4444ff" : g.color;
        ctx.beginPath();
        ctx.arc(g.c * TILE + 10, g.r * TILE + 10, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkLevelComplete() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (tileAt(r, c) === 2 || tileAt(r, c) === 3) {
                return false;
            }
        }
    }
    return true;
}

function nextLevel() {
    currentLevel++;

    if (currentLevel >= maps.length) {
        victoryScreen();
        return;
    }

    map = JSON.parse(JSON.stringify(maps[currentLevel]));
    levelEl.textContent = `Level: ${currentLevel + 1} / ${maps.length}`;
    resetPositions();
}

function victoryScreen() {
    gameOver = true;
    statusEl.textContent = "VICTORY! You cleared all levels!";
}

function update() {
    if (gameOver) return;

    updatePlayer();
    updateGhosts();

    if (powerMode) {
        powerTimer