const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const lapTimeEl = document.getElementById("lapTime");
const bestTimeEl = document.getElementById("bestTime");
const restartBtn = document.getElementById("restartBtn");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

let car, track, lastTime, lapStartTime, bestLap, gameRunning;

const laneWidth = 120; // distance allowed from centerline before penalty

function resetGame() {
  car = {
    x: WIDTH * 0.5,
    y: HEIGHT * 0.7,
    angle: -Math.PI / 2,
    speed: 0,
    maxSpeed: 4,
    accel: 0.08,
    brake: 0.15,
    friction: 0.02,
    turnSpeed: 0.04,
    radius: 8,
    checkpointIndex: 0
  };

  track = createTrack();
  lastTime = performance.now();
  lapStartTime = performance.now();
  gameRunning = true;

  lapTimeEl.textContent = "Lap: 0.00s";
  bestTimeEl.textContent = bestLap ? `Best: ${bestLap.toFixed(2)}s` : "Best: --";
}

function createTrack() {
  // simple rectangular loop with rounded corners
  const outer = [
    { x: 80, y: 60 },
    { x: WIDTH - 80, y: 60 },
    { x: WIDTH - 80, y: HEIGHT - 60 },
    { x: 80, y: HEIGHT - 60 }
  ];

  const inner = outer.map(p => ({
    x: p.x + 80 * Math.sign(p.x - WIDTH / 2),
    y: p.y + 40 * Math.sign(p.y - HEIGHT / 2)
  }));

  const checkpoints = [
    { x: WIDTH * 0.5, y: HEIGHT * 0.2 },
    { x: WIDTH * 0.8, y: HEIGHT * 0.5 },
    { x: WIDTH * 0.5, y: HEIGHT * 0.8 },
    { x: WIDTH * 0.2, y: HEIGHT * 0.5 }
  ];

  return { outer, inner, checkpoints };
}

function update(dt) {
  if (!gameRunning) return;

  // steering
  if (keys["a"] || keys["ArrowLeft"]) {
    car.angle -= car.turnSpeed * (car.speed / car.maxSpeed + 0.3);
  }
  if (keys["d"] || keys["ArrowRight"]) {
    car.angle += car.turnSpeed * (car.speed / car.maxSpeed + 0.3);
  }

  // acceleration / brake
  if (keys["w"] || keys["ArrowUp"]) {
    car.speed += car.accel;
  } else if (keys["s"] || keys["ArrowDown"]) {
    car.speed -= car.brake;
  } else {
    // friction
    if (car.speed > 0) car.speed -= car.friction;
    else if (car.speed < 0) car.speed += car.friction;
  }

  car.speed = Math.max(-1.5, Math.min(car.speed, car.maxSpeed));

  // movement
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;

  // lane departure sensor (distance from centerline checkpoint)
  const cp = track.checkpoints[car.checkpointIndex];
  const dxLane = car.x - cp.x;
  const dyLane = car.y - cp.y;
  const distLane = Math.sqrt(dxLane * dxLane + dyLane * dyLane);

  if (distLane > laneWidth) {
    car.speed *= 0.97; // off-lane penalty
  }

  // off-track slowdown
  if (!pointOnTrack(car.x, car.y, track)) {
    car.speed *= 0.95;
  }

  // checkpoint / lap logic
  const dx = car.x - cp.x;
  const dy = car.y - cp.y;
  if (dx * dx + dy * dy < 900) {
    car.checkpointIndex++;
    if (car.checkpointIndex >= track.checkpoints.length) {
      car.checkpointIndex = 0;

      const now = performance.now();
      const lapTime = (now - lapStartTime) / 1000;
      lapStartTime = now;

      lapTimeEl.textContent = `Lap: ${lapTime.toFixed(2)}s`;

      if (!bestLap || lapTime < bestLap) {
        bestLap = lapTime;
        bestTimeEl.textContent = `Best: ${bestLap.toFixed(2)}s`;
      }
    }
  }

  // update lap timer every frame
  const now = performance.now();
  const lapTime = (now - lapStartTime) / 1000;
  lapTimeEl.textContent = `Lap: ${lapTime.toFixed(2)}s`;
}

function pointOnTrack(x, y, track) {
  // approximate: inside outer polygon and outside inner polygon
  return insideRect(x, y, 80, 60, WIDTH - 80, HEIGHT - 60) &&
         !insideRect(x, y, WIDTH * 0.5 - 120, HEIGHT * 0.5 - 60, WIDTH * 0.5 + 120, HEIGHT * 0.5 + 60);
}

function insideRect(x, y, x1, y1, x2, y2) {
  return x > x1 && x < x2 && y > y1 && y < y2;
}

function drawTrack() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // road
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(track.outer[0].x, track.outer[0].y);
  for (let i = 1; i < track.outer.length; i++) {
    ctx.lineTo(track.outer[i].x, track.outer[i].y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(track.inner[0].x, track.inner[0].y);
  for (let i = 1; i < track.inner.length; i++) {
    ctx.lineTo(track.inner[i].x, track.inner[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // checkpoints
  ctx.fillStyle = "#ffcc00";
  for (const cp of track.checkpoints) {
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // start/finish line
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.5 - 20, HEIGHT * 0.2 - 10);
  ctx.lineTo(WIDTH * 0.5 + 20, HEIGHT * 0.2 + 10);
  ctx.stroke();
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  ctx.fillStyle = "#3af";
  ctx.fillRect(-10, -6, 20, 12);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, -5, 8, 10);

  ctx.restore();
}

function draw() {
  drawTrack();
  drawCar();
}

function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

restartBtn.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(loop);
