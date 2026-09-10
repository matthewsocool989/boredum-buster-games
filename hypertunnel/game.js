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

// INPUT
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
  gapWidth = width * 0.35; // nice and generous at start
  distance = 0;
  gameOver = false;

  segments.length = 0;
  for (let i = 0; i < 12; i++) {
    spawnSegment(-i * 80);
  }

  scoreEl.textContent = "Distance: 0";
}
resetGame();
updateHighscoreLabel();

restartBtn.addEventListener("click", () => {
  resetGame();
});

function updateHighscoreLabel() {
  highscoreEl.textContent = `Best: ${highscore}`;
}

// Spawn a segment with a gap that can be anywhere but clamped on-screen
function spawnSegment(y) {
  const center = width / 2;
  const maxOffset = width * 0.4; // can go pretty far left/right
  const offset = (Math.random() - 0.5) * maxOffset;

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

  // movement
  let move = 0;
  if (keys["ArrowLeft"] || keys["a"]) move -= 1;
  if (keys["ArrowRight"] || keys["d"]) move += 1;

  player.x += move * player.speed;
  player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));

  // move segments + gentle wiggle
  for (const s of segments) {
    s.y += speed;

    // small horizontal drift so you can't AFK center forever
    s.gapCenter += Math.sin((s.y + distance) * 0.008) * 1.5;
    s.gapCenter = Math.max(s.gapWidth / 2, Math.min(width - s.gapWidth / 2, s.gapCenter));
  }

  // recycle segments
  if (segments.length && segments[0].y > height + 40) {
    segments.shift();
    spawnSegment(segments[segments.length - 1].y - 80);
  }

  // difficulty ramp: smooth, playable
  distance += speed * dt;

  // gap shrinks slowly over time
  if (distance > 400 && gapWidth > width * 0.30) gapWidth = width * 0.30;
  if (distance > 1200 && gapWidth > width * 0.26) gapWidth = width * 0.26;
  if (distance > 2200 && gapWidth > width * 0.22) gapWidth = width * 0.22;
  if (distance > 3500 && gapWidth > width * 0.18) gapWidth = width * 0.18;

  // speed ramps gently
  if (distance > 1500 && speed < 5) speed = 5;
  if (distance > 3000 && speed < 6) speed = 6;
  if (distance > 5000 && speed < 7) speed = 7;

  scoreEl.textContent = `Distance: ${Math.floor(distance)}`;

  // collision
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

function draw() {
  ctx.clearRect(0, 0, width, height);

  // background
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  bgGrad.addColorStop(0, "#050510");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // tunnel segments (no tilt now, just clean lines)
  for (const s of segments) {
    ctx.strokeStyle = "#3af";
    ctx.lineWidth = 6;
    ctx.beginPath();

    const leftWall = s.gapCenter - s.gapWidth / 2;
    const rightWall = s.gapCenter + s.gapWidth / 2;

    ctx.moveTo(0, s.y);
    ctx.lineTo(leftWall, s.y);

    ctx.moveTo(rightWall, s.y);
    ctx.lineTo(width, s.y);

    ctx.stroke();
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
