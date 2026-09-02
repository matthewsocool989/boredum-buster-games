const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 40;
let score = 0;
let powerMode = 0;
let level = 0;

let MAP = JSON.parse(JSON.stringify(MAPS[level]));

const player = { r: 1, c: 1, dr: 0, dc: 0 };
const ghosts = [
    { r: 7, c: 7, color: "red" },
    { r: 7, c: 8, color: "pink" }
];

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") player.dr = -1, player.dc = 0;
    if (e.key === "ArrowDown") player.dr = 1, player.dc = 0;
    if (e.key === "ArrowLeft") player.dr = 0, player.dc = -1;
    if (e.key === "ArrowRight") player.dr = 0, player.dc = 1;
});

function canMove(r, c) {
    return MAP[r] && MAP[r][c] !== 1;
}

function movePlayer() {
    const nr = player.r + player.dr;
    const nc = player.c + player.dc;

    if (canMove(nr, nc)) {
        player.r = nr;
        player.c = nc;

        const tile = MAP[nr][nc];

        if (tile === 2) {
            MAP[nr][nc] = 0;
            score += 10;
        }

        if (tile === 3) {
            MAP[nr][nc] = 0;
            powerMode = 300;
        }
    }
}

function pelletsLeft() {
    for (let r = 0; r < MAP.length; r++)
        for (let c = 0; c < MAP[r].length; c++)
            if (MAP[r][c] === 2 || MAP[r][c] === 3) return true;
    return false;
}

function nextLevel() {
    level++;
    if (level >= MAPS.length) {
        window.location.href = "victory.html";
        return;
    }

    MAP = JSON.parse(JSON.stringify(MAPS[level]));
    player.r = 1;
    player.c = 1;
    ghosts[0].r = 7; ghosts[0].c = 7;
    ghosts[1].r = 7; ghosts[1].c = 8;
}

function moveGhosts() {
    ghosts.forEach(g => {
        let best = { r: g.r, c: g.c };
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
            if (canMove(nr, nc)) {
                const dist = Math.hypot(player.r - nr, player.c - nc);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = { r: nr, c: nc };
                }
            }
        });

        g.r = best.r;
        g.c = best.c;

        if (g.r === player.r && g.c === player.c) {
            if (powerMode > 0) {
                g.r = 7;
                g.c = 7;
                score += 200;
            } else {
                alert("You were caught!");
                location.reload();
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < MAP.length; r++) {
        for (let c = 0; c < MAP[r].length; c++) {
            const tile = MAP[r][c];

            if (tile === 1) {
                ctx.fillStyle = "#0033ff";
                ctx.fillRect(c*TILE, r*TILE, TILE, TILE);
            }
            if (tile === 2) {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(c*TILE+20, r*TILE+20, 4, 0, Math.PI*2);
                ctx.fill();
            }
            if (tile === 3) {
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(c*TILE+20, r*TILE+20, 10, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(player.c*TILE+20, player.r*TILE+20, 18, 0, Math.PI*2);
    ctx.fill();

    ghosts.forEach(g => {
        ctx.fillStyle = powerMode > 0 ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(g.c*TILE+20, g.r*TILE+20, 18, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.fillStyle = "#00eaff";
    ctx.fillText("Score: " + score, 10, 610);
    ctx.fillText("Level: " + (level + 1), 480, 610);
}

function gameLoop() {
    movePlayer();
    moveGhosts();
    draw();

    if (!pelletsLeft()) nextLevel();
    if (powerMode > 0) powerMode--;

    requestAnimationFrame(gameLoop);
}

gameLoop();
