const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const cols = 20;
const rows = 20;
const cellSize = canvas.width / cols;

let maze = [];
let player = { x: 0, y: 0 };
let exit = { x: cols - 1, y: rows - 1 };
let gameWon = false;

// Timer
let time = 0;
let timerInterval = null;
const timerDisplay = document.getElementById("timerDisplay");

// Directions for maze generation
const DIRS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
];

function createGrid() {
    maze = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push({
                x,
                y,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
            });
        }
        maze.push(row);
    }
}

function getCell(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
    return maze[y][x];
}

function generateMaze() {
    createGrid();

    let stack = [];
    let current = getCell(0, 0);
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
        current = stack[stack.length - 1];

        let neighbors = [];
        DIRS.forEach((d, i) => {
            let nx = current.x + d.x;
            let ny = current.y + d.y;
            let neighbor = getCell(nx, ny);
            if (neighbor && !neighbor.visited) {
                neighbors.push({ cell: neighbor, dirIndex: i });
            }
        });

        if (neighbors.length > 0) {
            let { cell: next, dirIndex } = neighbors[Math.floor(Math.random() * neighbors.length)];

            if (dirIndex === 0) {
                current.walls.top = false;
                next.walls.bottom = false;
            } else if (dirIndex === 1) {
                current.walls.right = false;
                next.walls.left = false;
            } else if (dirIndex === 2) {
                current.walls.bottom = false;
                next.walls.top = false;
            } else if (dirIndex === 3) {
                current.walls.left = false;
                next.walls.right = false;
            }

            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    player = { x: 0, y: 0 };
    exit = { x: cols - 1, y: rows - 1 };
    gameWon = false;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;

    maze.forEach(row => {
        row.forEach(cell => {
            let x = cell.x * cellSize;
            let y = cell.y * cellSize;

            ctx.beginPath();
            if (cell.walls.top) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
            }
            if (cell.walls.right) {
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            if (cell.walls.bottom) {
                ctx.moveTo(x, y + cellSize);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            if (cell.walls.left) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + cellSize);
            }
            ctx.stroke();
        });
    });

    // Exit
    ctx.fillStyle = "green";
    ctx.fillRect(
        exit.x * cellSize + 4,
        exit.y * cellSize + 4,
        cellSize - 8,
        cellSize - 8
    );

    // Player
    ctx.fillStyle = "#00eaff";
    ctx.fillRect(
        player.x * cellSize + 6,
        player.y * cellSize + 6,
        cellSize - 12,
        cellSize - 12
    );

    if (gameWon) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("You escaped!", canvas.width / 2 - 70, canvas.height / 2);

        ctx.font = "18px Arial";
        ctx.fillText(`Final Time: ${time}s`, canvas.width / 2 - 60, canvas.height / 2 + 30);

        ctx.font = "16px Arial";
        ctx.fillText("Press R to regenerate", canvas.width / 2 - 90, canvas.height / 2 + 60);
    }
}

function canMoveTo(nx, ny) {
    let current = getCell(player.x, player.y);
    let target = getCell(nx, ny);
    if (!target) return false;

    if (nx === player.x && ny === player.y - 1 && !current.walls.top && !target.walls.bottom) return true;
    if (nx === player.x + 1 && ny === player.y && !current.walls.right && !target.walls.left) return true;
    if (nx === player.x && ny === player.y + 1 && !current.walls.bottom && !target.walls.top) return true;
    if (nx === player.x - 1 && ny === player.y && !current.walls.left && !target.walls.right) return true;

    return false;
}

document.addEventListener("keydown", (e) => {
    if (gameWon) {
        if (e.key.toLowerCase() === "r") {
            generateMaze();
            time = 0;

            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!gameWon) {
                    time++;
                    timerDisplay.textContent = `Time: ${time}s`;
                }
            }, 1000);

            timerDisplay.textContent = `Time: ${time}s`;
            drawMaze();
        }
        return;
    }

    let nx = player.x;
    let ny = player.y;

    if (e.key.toLowerCase() === "w") ny--;
    if (e.key.toLowerCase() === "s") ny++;
    if (e.key.toLowerCase() === "a") nx--;
    if (e.key.toLowerCase() === "d") nx++;

    if (canMoveTo(nx, ny)) {
        player.x = nx;
        player.y = ny;
    }

    if (player.x === exit.x && player.y === exit.y) {
        gameWon = true;
    }

    drawMaze();
});

function start() {
    generateMaze();
    time = 0;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameWon) {
            time++;
            timerDisplay.textContent = `Time: ${time}s`;
        }
    }, 1000);

    timerDisplay.textContent = `Time: ${time}s`;
    drawMaze();
}

start();
