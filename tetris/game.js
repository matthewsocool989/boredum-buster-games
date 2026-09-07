const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const COLORS = {
    0: "#000000",
    1: "#00eaff",
    2: "#ff00aa",
    3: "#00ff88",
    4: "#ffcc00",
    5: "#ff4444",
    6: "#aa66ff",
    7: "#44ffdd"
};

let board = createMatrix(COLS, ROWS);
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let gameOver = false;

const TETROMINOS = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [2, 2],
        [2, 2]
    ],
    T: [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
    ],
    S: [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0]
    ],
    Z: [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
    ],
    J: [
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0]
    ]
};

function createMatrix(cols, rows) {
    const matrix = [];
    for (let y = 0; y < rows; y++) {
        matrix[y] = [];
        for (let x = 0; x < cols; x++) {
            matrix[y][x] = 0;
        }
    }
    return matrix;
}

function drawBlock(x, y, value) {
    if (value === 0) return;
    ctx.fillStyle = COLORS[value];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            drawBlock(x, y, board[y][x]);
        }
    }

    if (currentPiece) {
        for (let y = 0; y < currentPiece.length; y++) {
            for (let x = 0; x < currentPiece[y].length; x++) {
                if (currentPiece[y][x] !== 0) {
                    drawBlock(currentX + x, currentY + y, currentPiece[y][x]);
                }
            }
        }
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over", 40, canvas.height / 2);
        ctx.font = "16px Arial";
        ctx.fillText("Press R to restart", 40, canvas.height / 2 + 30);
    }
}

function collide(board, piece, offsetX, offsetY) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const newX = x + offsetX;
                const newY = y + offsetY;

                if (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX] !== 0)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge(board, piece, offsetX, offsetY) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const newX = x + offsetX;
                const newY = y + offsetY;
                if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                    board[newY][newX] = piece[y][x];
                }
            }
        }
    }
}

function rotate(piece) {
    const size = piece.length;
    const rotated = [];
    for (let y = 0; y < size; y++) {
        rotated[y] = [];
        for (let x = 0; x < size; x++) {
            rotated[y][x] = piece[size - 1 - x][y] || 0;
        }
    }
    return rotated;
}

function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        let full = true;
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] === 0) {
                full = false;
                break;
            }
        }
        if (full) {
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < COLS; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }
            for (let x = 0; x < COLS; x++) {
                board[0][x] = 0;
            }
            y++; // re-check same row after shift
        }
    }
}

function spawnPiece() {
    const keys = Object.keys(TETROMINOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const shape = TETROMINOS[randomKey];

    currentPiece = shape.map(row => row.slice());
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
    currentY = -2;

    if (collide(board, currentPiece, currentX, currentY + 1)) {
        gameOver = true;
    }
}

function drop() {
    if (gameOver) return;

    if (!collide(board, currentPiece, currentX, currentY + 1)) {
        currentY++;
    } else {
        merge(board, currentPiece, currentX, currentY);
        clearLines();
        spawnPiece();
    }
}

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if (!gameOver && dropCounter > dropInterval) {
        drop();
        dropCounter = 0;
    }

    drawBoard();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
    if (gameOver) {
        if (e.key.toLowerCase() === "r") {
            resetGame();
        }
        return;
    }

    if (e.key.toLowerCase() === "a") {
        if (!collide(board, currentPiece, currentX - 1, currentY)) {
            currentX--;
        }
    }

    if (e.key.toLowerCase() === "d") {
        if (!collide(board, currentPiece, currentX + 1, currentY)) {
            currentX++;
        }
    }

    if (e.key.toLowerCase() === "s") {
        drop();
        dropCounter = 0;
    }

    if (e.key.toLowerCase() === "w") {
        const rotated = rotate(currentPiece);
        if (!collide(board, rotated, currentX, currentY)) {
            currentPiece = rotated;
        }
    }
});

function resetGame() {
    board = createMatrix(COLS, ROWS);
    gameOver = false;
    dropCounter = 0;
    lastTime = 0;
    spawnPiece();
}

spawnPiece();
update();
