const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = 800;
let height = 300;

function resizeCanvas() {
  const w = window.innerWidth * 0.9;
  const h = window.innerHeight * 0.5;
  width = w;
  height = h;
  canvas.width = width;
  canvas.height = height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const restartBtn = document.getElementById("restartBtn");

let player, obstacles, speed, gravity, distance, gameOver;
let highscore = parseInt(localStorage.getItem("dino_dash_highscore") || "0", 10);

// INPUT
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function resetGame() {
  player = {
    x: 80,
    y: height - 60,
    w: 40,
    h: 50,
    vy: 0,
    jumpForce: 14,
    grounded: true,
    ducking: false
  };

  obstacles = [];
  speed = 6;
  gravity = 0.7;
  distance = 0;
  gameOver = false;

  scoreEl.textContent = "Distance: 0";
}
resetGame();
updateHighscoreLabel();

restartBtn.addEventListener("click", resetGame);

function updateHighscoreLabel() {
  highscoreEl.textContent = `Best: ${highscore}`;
}

function spawnObstacle() {
  const type = Math.random() < 0.7 ? "cactus" : "bird";

  if (type === "cactus") {
    const w = 20 + Math.random() * 20;
    const h = 30 + Math.random() * 40;
    obstacles.push({
      x: width + 20,
      y: height - h,
      w,
      h,
      type
    });
  } else {
    const h = 30;
    const y = Math.random() < 0.5 ? height - 120 : height - 180;
    obstacles.push({
      x: width + 20,
      y,
      w: 40,
      h,
      type
    });
  }
}

function update(dt) {
  if (gameOver) return;

  // Jump
  if ((keys[" "] || keys["ArrowUp"]) && player.grounded) {
    player.vy = -player.jumpForce;
    player.grounded = false;
  }

  // Duck
  player.ducking = keys["ArrowDown"] && player.grounded;
  player.h = player.ducking ? 30 : 50;

  // Gravity
  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= height - player.h) {
    player.y = height - player.h;
    player.vy = 0;
    player.grounded = true;
  }

  // Move obstacles
  for (const o of obstacles) {
    o.x -= speed;
  }

  // Remove off-screen
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Spawn new obstacles
  if (Math.random() < 0.02) spawnObstacle();

  // Difficulty ramp
  distance += speed * dt;
  if (distance > 300 && speed < 7) speed = 7;
  if (distance > 800 && speed < 8) speed = 8;
  if (distance > 1500 && speed < 9) speed = 9;

  scoreEl.textContent = `Distance: ${Math.floor(distance)}`;

  // Collision
  for (const o of obstacles) {
    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      endGame();
      break;
    }
  }
}

function endGame() {
  gameOver = true;
  const finalScore = Math.floor(distance);
  if (finalScore > highscore) {
    highscore = finalScore;
    localStorage.setItem("dino_dash_highscore", String(highscore));
    updateHighscoreLabel();
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, height - 4, width, 4);

  // player
  ctx.fillStyle = "#3af";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // obstacles
  ctx.fillStyle = "#0f0";
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
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
