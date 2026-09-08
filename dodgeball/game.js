const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = 800;
let height = 600;

function resizeCanvas() {
  const ratio = 4 / 3;
  const w = window.innerWidth * 0.9;
  const h = window.innerHeight * 0.8;

  if (w / h > ratio) {
    height = h;
    width = h * ratio;
  } else {
    width = w;
    height = w / ratio;
  }

  canvas.width = width;
  canvas.height = height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// UI
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const restartBtn = document.getElementById("restartBtn");

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Game state
let player, balls, startTime, gameOver, lastSpawn;
let highscore = parseFloat(localStorage.getItem("dodgeball_highscore") || "0");

function resetGame() {
  player = {
    x: width / 2,
    y: height / 2,
    size: 18,
    speed: 4.5
  };

  balls = [];
  startTime = performance.now();
  lastSpawn = performance.now();
  gameOver = false;
}
resetGame();
updateHighscoreLabel();

restartBtn.addEventListener("click", resetGame);

function updateHighscoreLabel() {
  highscoreEl.textContent = `Best: ${highscore.toFixed(1)}s`;
}

function spawnBall() {
  const size = 16;
  const speed = 2 + Math.random() * 2;

  const edge = Math.floor(Math.random() * 4);
  let x, y, vx, vy;

  if (edge === 0) { // top
    x = Math.random() * width;
    y = -size;
    vx = (Math.random() - 0.5) * speed;
    vy = speed;
  } else if (edge === 1) { // bottom
    x = Math.random() * width;
    y = height + size;
    vx = (Math.random() - 0.5) * speed;
    vy = -speed;
  } else if (edge === 2) { // left
    x = -size;
    y = Math.random() * height;
    vx = speed;
    vy = (Math.random() - 0.5) * speed;
  } else { // right
    x = width + size;
    y = Math.random() * height;
    vx = -speed;
    vy = (Math.random() - 0.5) * speed;
  }

  balls.push({ x, y, vx, vy, size });
}

function update(dt) {
  if (gameOver) return;

  // Movement
  let dx = 0, dy = 0;
  if (keys["ArrowUp"] || keys["w"]) dy -= 1;
  if (keys["ArrowDown"] || keys["s"]) dy += 1;
  if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
  if (keys["ArrowRight"] || keys["d"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    player.x += dx * player.speed;
    player.y += dy * player.speed;
  }

  // Clamp
  player.x = Math.max(player.size, Math.min(width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(height - player.size, player.y));

  // Spawn balls
  const now = performance.now();
  if (now - lastSpawn > 1000) {
    spawnBall();
    lastSpawn = now;
  }

  // Move balls
  for (const b of balls) {
    b.x += b.vx;
    b.y += b.vy;

    // Bounce
    if (b.x < b.size && b.vx < 0) b.vx *= -1;
    if (b.x > width - b.size && b.vx > 0) b.vx *= -1;
    if (b.y < b.size && b.vy < 0) b.vy *= -1;
    if (b.y > height - b.size && b.vy > 0) b.vy *= -1;

    // Collision
    const dist = Math.hypot(b.x - player.x, b.y - player.y);
    if (dist < b.size + player.size) {
      endGame();
      break;
    }
  }

  // Score
  const elapsed = (now - startTime) / 1000;
  scoreEl.textContent = `Time: ${elapsed.toFixed(1)}s`;
}

function endGame() {
  gameOver = true;
  const elapsed = (performance.now() - startTime) / 1000;

  if (elapsed > highscore) {
    highscore = elapsed;
    localStorage.setItem("dodgeball_highscore", String(highscore));
    updateHighscoreLabel();
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Player
  ctx.fillStyle = "#3af";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Balls
  for (const b of balls) {
    const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.size);
    g.addColorStop(0, "#f0f");
    g.addColorStop(1, "#a03");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "28px system-ui";
    ctx.fillText("Game Over", width / 2, height / 2 - 10);

    ctx.font = "18px system-ui";
    ctx.fillText("Press Restart to play again", width / 2, height / 2 + 20);
  }
}

let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
