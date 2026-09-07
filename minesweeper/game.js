const boardElement = document.getElementById("board");

const rows = 10;
const cols = 10;
const mineCount = 15;

let board = [];
let gameOver = false;

function createBoard() {
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 32px)`;

    board = [];

    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({
                x,
                y,
                mine: false,
                revealed: false,
                flagged: false,
                number: 0,
                element: null
            });
        }
        board.push(row);
    }

    placeMines();
    calculateNumbers();
    drawBoard();
}

function placeMines() {
    let placed = 0;
    while (placed < mineCount) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);

        if (!board[y][x].mine) {
            board[y][x].mine = true;
            placed++;
        }
    }
}

function calculateNumbers() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x].mine) continue;

            let count = 0;

            for (let yy = -1; yy <= 1; yy++) {
                for (let xx = -1; xx <= 1; xx++) {
                    const nx = x + xx;
                    const ny = y + yy;

                    if (
                        nx >= 0 && nx < cols &&
                        ny >= 0 && ny < rows &&
                        board[ny][nx].mine
                    ) {
                        count++;
                    }
                }
            }

            board[y][x].number = count;
        }
    }
}

function drawBoard() {
    boardElement.innerHTML = "";

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = board[y][x];
            const div = document.createElement("div");
            div.classList.add("cell");

            div.addEventListener("click", () => revealCell(cell));
            div.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });

            cell.element = div;
            boardElement.appendChild(div);
        }
    }
}

function revealCell(cell) {
    if (gameOver || cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add("revealed");

    if (cell.mine) {
        cell.element.classList.add("mine");
        endGame(false);
        return;
    }

    if (cell.number > 0) {
        cell.element.textContent = cell.number;
    } else {
        floodFill(cell);
    }

    checkWin();
}

function floodFill(cell) {
    const stack = [cell];

    while (stack.length > 0) {
        const current = stack.pop();

        for (let yy = -1; yy <= 1; yy++) {
            for (let xx = -1; xx <= 1; xx++) {
                const nx = current.x + xx;
                const ny = current.y + yy;

                if (
                    nx >= 0 && nx < cols &&
                    ny >= 0 && ny < rows
                ) {
                    const neighbor = board[ny][nx];

                    if (!neighbor.revealed && !neighbor.mine && !neighbor.flagged) {
                        neighbor.revealed = true;
                        neighbor.element.classList.add("revealed");

                        if (neighbor.number > 0) {
                            neighbor.element.textContent = neighbor.number;
                        } else {
                            stack.push(neighbor);
                        }
                    }
                }
            }
        }
    }
}

function toggleFlag(cell) {
    if (gameOver || cell.revealed) return;

    cell.flagged = !cell.flagged;

    if (cell.flagged) {
        cell.element.classList.add("flag");
        cell.element.textContent = "⚑";
    } else {
        cell.element.classList.remove("flag");
        cell.element.textContent = "";
    }
}

function endGame(won) {
    gameOver = true;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = board[y][x];
            if (cell.mine) {
                cell.element.classList.add("mine");
            }
        }
    }

    setTimeout(() => {
        alert(won ? "You Win!" : "Game Over!");
    }, 200);
}

function checkWin() {
    let revealedCount = 0;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x].revealed) revealedCount++;
        }
    }

    if (revealedCount === rows * cols - mineCount) {
        endGame(true);
    }
}

function resetGame() {
    gameOver = false;
    createBoard();
}

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
        resetGame();
    }
});

createBoard();
