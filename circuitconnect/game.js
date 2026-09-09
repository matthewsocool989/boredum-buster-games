const rows = 5;
const cols = 5;
let board = [];
let moves = 0;

const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");

const TILE_TYPES = [
  { name: "straight", connections: ["up", "down"] },
  { name: "straight", connections: ["left", "right"] },
  { name: "corner", connections: ["up", "right"] },
  { name: "corner", connections: ["right", "down"] },
  { name: "corner", connections: ["down", "left"] },
  { name: "corner", connections: ["left", "up"] },
  { name: "tee", connections: ["up", "left", "right"] },
  { name: "tee", connections: ["down", "left", "right"] },
];

function randomTileType() {
  return JSON.parse(JSON.stringify(
    TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
  ));
}

function initBoard() {
  board = [];
  moves = 0;
  messageEl.textContent = "";
  movesEl.textContent = moves;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const tile = randomTileType();
      tile.rotation = Math.floor(Math.random() * 4);
      tile.isStart = false;
      tile.isEnd = false;
      row.push(tile);
    }
    board.push(row);
  }

  // set start and end
  board[2][0].isStart = true;
  board[2][0].connections = ["right"];
  board[2][0].rotation = 0;

  board[2][cols - 1].isEnd = true;
  board[2][cols - 1].connections = ["left"];
  board[2][cols - 1].rotation = 0;

  renderBoard();
}

function rotateConnections(connections) {
  // rotate clockwise: up->right, right->down, down->left, left->up
  return connections.map(dir => {
    if (dir === "up") return "right";
    if (dir === "right") return "down";
    if (dir === "down") return "left";
    if (dir === "left") return "up";
  });
}

function getRotatedConnections(tile) {
  let conns = [...tile.connections];
  for (let i = 0; i < tile.rotation; i++) {
    conns = rotateConnections(conns);
  }
  return conns;
}

function renderBoard() {
  boardEl.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileData = board[r][c];
      const tileEl = document.createElement("div");
      tileEl.classList.add("tile");
      if (tileData.isStart) tileEl.classList.add("start");
      if (tileData.isEnd) tileEl.classList.add("end");

      const conns = getRotatedConnections(tileData);

      const dirs = ["up", "down", "left", "right"];
      dirs.forEach(dir => {
        const line = document.createElement("div");
        line.classList.add("tile-line", `line-${dir}`);
        if (!conns.includes(dir)) {
          line.classList.add("off");
        }
        tileEl.appendChild(line);
      });

      tileEl.addEventListener("click", () => {
        onTileClick(r, c);
      });

      boardEl.appendChild(tileEl);
    }
  }
}

function onTileClick(r, c) {
  const tile = board[r][c];
  if (tile.isStart || tile.isEnd) return;

  tile.rotation = (tile.rotation + 1) % 4;
  moves++;
  movesEl.textContent = moves;
  renderBoard();
  checkCircuit();
}

function checkCircuit() {
  // BFS from start, following connections
  const start = { r: 2, c: 0 };
  const end = { r: 2, c: cols - 1 };

  const visited = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  const queue = [start];
  visited[start.r][start.c] = true;

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    const tile = board[r][c];
    const conns = getRotatedConnections(tile);

    const neighbors = [];
    conns.forEach(dir => {
      let nr = r;
      let nc = c;
      if (dir === "up") nr--;
      if (dir === "down") nr++;
      if (dir === "left") nc--;
      if (dir === "right") nc++;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

      const neighborTile = board[nr][nc];
      const neighborConns = getRotatedConnections(neighborTile);

      // check if neighbor has opposite connection
      const opposite =
        dir === "up" ? "down" :
        dir === "down" ? "up" :
        dir === "left" ? "right" :
        "left";

      if (neighborConns.includes(opposite)) {
        neighbors.push({ r: nr, c: nc });
      }
    });

    for (const n of neighbors) {
      if (!visited[n.r][n.c]) {
        visited[n.r][n.c] = true;
        queue.push(n);
      }
    }
  }

  if (visited[end.r][end.c]) {
    messageEl.textContent = "Circuit complete! Nice work.";
  } else {
    messageEl.textContent = "";
  }
}

newGameBtn.addEventListener("click", initBoard);

initBoard();
