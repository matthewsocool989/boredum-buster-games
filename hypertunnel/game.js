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

const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const restartBtn = document.getElementById("restartBtn");

let player, segments, speed, gapWidth, distance, gameOver;
let highscore = parseInt(localStorage.getItem("hyper_tunnel_highscore") || "0", 10);

// KEYBOARD INPUT
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function resetGame() {
  player = {
    x: width / 2,
    y: height * 0.8,
    radius: 10,
    speed: 6
  };
  segments = [];
  speed = 4;
  gapWidth = width * 0.35;
  distance = 0;
  gameOver = false;
  segments.length = 0;
  for (let i = 0; i < 10; i++) {
    spawnSegment(-i * 80);
  }
}
resetGame();
updateHighscoreLabel();

restartBtn.addEventListener("click", () => {
  resetGame();
});

function updateHighscoreLabel() {
  highscoreEl.textContent = `Best: ${highscore}`;
}

// FIX 1 + FIX 2 + FIX 4: Bigger offsets + center punishment + clamped gap
function spawnSegment(y) {
  const center = width / 2;
  const maxOffset = width * 0.45;
  const offset = (Math.random() - 0.5) * maxOffset;

  // punish center camping
  const playerCenterBias = Math.abs(player.x - width / 2);
  if (playerCenterBias < width * 0.05 && Math.random() < 0.4) {
    const side = Math.random() < 0.5 ? 0.2 : 0.8;
    const gapCenter = width * side;
    segments.push({ y, gapCenter, gapWidth });
    return;
  }

  let gapCenter = center + offset;
  gapCenter = Math.max(gapWidth / 2, Math.min(width - gapWidth / 2, gapCenter));

  segments.push({
    y,
    gapCenter,
    gapWidth
  });
}

function update(dt) {
  if (gameOver) return;

  // KEYBOARD MOVEMENT
  let move = 0;
  if (keys["ArrowLeft"] || keys["a"]) move -= 1;
  if (keys["ArrowRight"] || keys["d"]) move += 1;

  player.x += move * player.speed;

  // clamp
  player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));

  // FIX 1: horizontal wiggle
  for (const s of segments) {
    s.y += speed;

    s.gapCenter += Math.sin((s.y + distance) * 0.01) * 2;

    s.gapCenter = Math.max(gapWidth / 2, Math.min(width - gapWidth / 2, s.gapCenter));
  }

  // remove off-screen segments and add new
  if (segments.length && segments[0].y > height + 40) {
    segments.shift();
    spawnSegment(segments[segments.length - 1].y - 80);
  }

  // FIX 3: faster difficulty ramp
  distance += speed * dt;

  if (distance > 300 && gapWidth > width * 0.28) gapWidth = width * 0.28;
  if (distance > 800 && gapWidth > width * 0.22) gapWidth = width * 0.22;
  if (distance > 1500 && gapWidth > width * 0.18) gapWidth = width * 0.18;
  if (distance > 2500 && gapWidth > width * 0.14) gapWidth = width * 0.14;

  if (distance > 2000 && speed < 6) speed = 6;
  if (distance > 4000 && speed < 8) speed = 8;
  if (distance > 6000 && speed < 10) speed = 10;

  scoreEl.textContent = `Distance: ${Math.floor(distance)}`;

  // collision detection
  for (const s of segments) {
    if (Math.abs(s.y - player.y) < 20) {
      const leftWall = s.gapCenter - s.gapWidth / 2;
      const rightWall = s.gapCenter + s.gapWidth / 2;
      if (player.x < leftWall + player.radius || player.x > rightWall - player.radius) {
        endGame();
      }
      break;
    }
  }
}

function endGame() {
  gameOver = true;
  const finalScore = Math.floor(distance);
  if (finalScore > highscore) {
    highscore = finalScore;
    localStorage.setItem("hyper_tunnel_highscore", String(highscore));
    updateHighscoreLabel();
  }
}

// FIX 5: diagonal segments
function draw() {
  ctx.clearRect(0, 0, width, height);

  // tunnel background
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  bgGrad.addColorStop(0, "#050510");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // segments (tilted)
  for (const s of segments) {
    ctx.save();
    ctx.translate(0, s.y);
    ctx.rotate(0.03);

    ctx.strokeStyle = "#3af";
    ctx.lineWidth = 6;
    ctx.beginPath();

    const leftWall = s.gapCenter - s.gapWidth / 2;
    const rightWall = s.gapCenter + s.gapWidth / 2;

    ctx.moveTo(0, 0);
    ctx.lineTo(leftWall, 0);

    ctx.moveTo(rightWall, 0);
    ctx.lineTo(width, 0);

    ctx.stroke();
    ctx.restore();
  }

  // player
  const grad = ctx.createRadialGradient(
    player.x, player.y, 2,
    player.x, player.y, player.radius
  );
  grad.addColorStop(0, "#fff");
  grad.addColorStop(1, "#3af");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

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
