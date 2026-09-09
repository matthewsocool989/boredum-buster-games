const boardSize = 4;
let board = [];
let score = 0;
let gameOver = false;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");

function initBoard() {
  board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(0)
  );
  score = 0;
  gameOver = false;
  messageEl.textContent = "";
  addRandomTile();
  addRandomTile();
  renderBoard();
  updateScore();
}

function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const value = board[r][c];
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (value === 0) {
        tile.classList.add("empty");
      } else {
        tile.classList.add(`tile-${value}`);
        tile.textContent = value;
      }
      boardEl.appendChild(tile);
    }
  }
}

function updateScore() {
  scoreEl.textContent = score;
}

function slideRow(row) {
  const filtered = row.filter(v => v !== 0);
  const merged = [];
  let skip = false;

  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const newVal = filtered[i] * 2;
      merged.push(newVal);
      score += newVal;
      skip = true;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < boardSize) {
    merged.push(0);
  }
  return merged;
}

function rotateBoard(times) {
  for (let t = 0; t < times; t++) {
    const newBoard = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(0)
    );
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        newBoard[c][boardSize - 1 - r] = board[r][c];
      }
    }
    board = newBoard;
  }
}

function move(direction) {
  if (gameOver) return;

  const oldBoard = JSON.stringify(board);

  // 0: left, 1: up, 2: right, 3: down
  if (direction === "left") {
    // no rotation
  } else if (direction === "up") {
    rotateBoard(1);
  } else if (direction === "right") {
    rotateBoard(2);
  } else if (direction === "down") {
    rotateBoard(3);
  }

  for (let r = 0; r < boardSize; r++) {
    board[r] = slideRow(board[r]);
  }

  // rotate back
  if (direction === "left") {
    // no rotation
  } else if (direction === "up") {
    rotateBoard(3);
  } else if (direction === "right") {
    rotateBoard(2);
  } else if (direction === "down") {
    rotateBoard(1);
  }

  const newBoard = JSON.stringify(board);
  if (newBoard !== oldBoard) {
    addRandomTile();
    renderBoard();
    updateScore();
    checkGameOver();
  }
}

function checkGameOver() {
  // any empty?
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) return;
    }
  }

  // any merges possible?
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const val = board[r][c];
      if (
        (r > 0 && board[r - 1][c] === val) ||
        (r < boardSize - 1 && board[r + 1][c] === val) ||
        (c > 0 && board[r][c - 1] === val) ||
        (c < boardSize - 1 && board[r][c + 1] === val)
      ) {
        return;
      }
    }
  }

  gameOver = true;
  messageEl.textContent = "Game Over — press New Game to try again.";
}

// Keyboard controls
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") move("left");
  else if (e.key === "ArrowRight") move("right");
  else if (e.key === "ArrowUp") move("up");
  else if (e.key === "ArrowDown") move("down");
});

// Simple swipe controls
let touchStartX = 0;
let touchStartY = 0;

boardEl.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

boardEl.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20) move("right");
    else if (dx < -20) move("left");
  } else {
    if (dy > 20) move("down");
    else if (dy < -20) move("up");
  }
});

newGameBtn.addEventListener("click", initBoard);

// Start
initBoard();
