const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let objects = [];
let sliceTrail = [];
let score = 0;
let misses = 0;
let gameOver = false;

const spawnRate = 1000; // ms
const objectSpeed = 2;

function spawnObject() {
    const obj = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        radius: 20,
        sliced: false,
        color: getRandomColor()
    };
    objects.push(obj);
}

function getRandomColor() {
    const colors = ["#00eaff", "#ff00aa", "#00ff88", "#ffcc00"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawObjects() {
    objects.forEach(obj => {
        if (!obj.sliced) {
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updateObjects() {
    objects.forEach(obj => {
        obj.y += objectSpeed;

        if (!obj.sliced && obj.y > canvas.height + 20) {
            misses++;
            obj.sliced = true;
            if (misses >= 5) gameOver = true;
        }
    });
}

function drawSliceTrail() {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < sliceTrail.length - 1; i++) {
        const p1 = sliceTrail[i];
        const p2 = sliceTrail[i + 1];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }

    ctx.stroke();
}

function checkSlice(x, y) {
    objects.forEach(obj => {
        if (!obj.sliced) {
            const dx = obj.x - x;
            const dy = obj.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < obj.radius) {
                obj.sliced = true;
                score++;
            }
        }
    });
}

canvas.addEventListener("mousemove", (e) => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sliceTrail.push({ x, y });
    if (sliceTrail.length > 20) sliceTrail.shift();

    checkSlice(x, y);
});

canvas.addEventListener("mousedown", () => {
    sliceTrail = [];
});

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Misses: " + misses + "/5", 20, 60);
}

function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
}

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && gameOver) {
        resetGame();
    }
});

function resetGame() {
    objects = [];
    sliceTrail = [];
    score = 0;
    misses = 0;
    gameOver = false;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        updateObjects();
        drawObjects();
        drawSliceTrail();
        drawScore();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

setInterval(() => {
    if (!gameOver) spawnObject();
}, spawnRate);

gameLoop();
