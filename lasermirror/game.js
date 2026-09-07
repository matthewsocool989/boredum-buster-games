const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const mirrors = [
    { x: 150, y: 150, size: 60, angle: 45, dragging: false },
    { x: 350, y: 200, size: 60, angle: -45, dragging: false }
];

const laser = {
    x: 50,
    y: 200,
    dx: 4,
    dy: 0
};

const target = {
    x: 520,
    y: 180,
    width: 40,
    height: 40
};

let draggingMirror = null;

function drawLaserPath() {
    let lx = laser.x;
    let ly = laser.y;
    let dx = laser.dx;
    let dy = laser.dy;

    ctx.strokeStyle = "#ff0044";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, ly);

    for (let i = 0; i < 500; i++) {
        lx += dx;
        ly += dy;

        // Mirror collision
        for (const m of mirrors) {
            if (
                lx > m.x &&
                lx < m.x + m.size &&
                ly > m.y &&
                ly < m.y + m.size
            ) {
                // reflect based on mirror angle
                if (m.angle === 45) {
                    [dx, dy] = [dy, dx];
                } else if (m.angle === -45) {
                    [dx, dy] = [-dy, -dx];
                }
            }
        }

        // Draw segment
        ctx.lineTo(lx, ly);

        // Target hit
        if (
            lx > target.x &&
            lx < target.x + target.width &&
            ly > target.y &&
            ly < target.y + target.height
        ) {
            ctx.stroke();
            drawWin();
            return;
        }

        // Stop if out of bounds
        if (lx < 0 || lx > canvas.width || ly < 0 || ly > canvas.height) {
            ctx.stroke();
            return;
        }
    }

    ctx.stroke();
}

function drawMirrors() {
    mirrors.forEach(m => {
        ctx.save();
        ctx.translate(m.x + m.size / 2, m.y + m.size / 2);
        ctx.rotate((m.angle * Math.PI) / 180);

        ctx.fillStyle = "#00eaff";
        ctx.fillRect(-m.size / 2, -5, m.size, 10);

        ctx.restore();
    });
}

function drawTarget() {
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(target.x, target.y, target.width, target.height);
}

function drawWin() {
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText("You Win!", canvas.width / 2 - 70, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMirrors();
    drawTarget();
    drawLaserPath();

    requestAnimationFrame(draw);
}

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mirrors.forEach(m => {
        if (
            mx > m.x &&
            mx < m.x + m.size &&
            my > m.y &&
            my < m.y + m.size
        ) {
            m.dragging = true;
            draggingMirror = m;
        }
    });
});

canvas.addEventListener("mousemove", (e) => {
    if (!draggingMirror) return;

    const rect = canvas.getBoundingClientRect();
    draggingMirror.x = e.clientX - rect.left - draggingMirror.size / 2;
    draggingMirror.y = e.clientY - rect.top - draggingMirror.size / 2;
});

canvas.addEventListener("mouseup", () => {
    if (draggingMirror) draggingMirror.dragging = false;
    draggingMirror = null;
});

draw();
