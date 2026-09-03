const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Jump sound
const tweetSound = new Audio("tweet.mp3");
tweetSound.volume = 0.6;

// Bird settings
let bird = {
    x: 80,
    y: 300,
    width: 30,
    height: 30,
    velocity: 0
};

// Physics (weaker gravity + less responsive jump)
let gravity = 0.25;
let jumpForce = -6.5;

// Pipes
let pipes = [];
let pipeGap = 200;        // wider gaps
let pipeWidth = 60;
let pipeSpeed = 2;

// Game state
let score = 0;
let gameOver = false;

// Countdown system
let gameStarted = false;
let countdown = 3;

// Spawn pipes every 2 seconds
setInterval(() => {
    if (!gameOver && gameStarted) {
        let topHeight = Math.random() * 300 + 50;
        let bottomY = topHeight + pipeGap;

        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: bottomY
        });
    }
}, 2000);

// Countdown function
function startCountdown() {
    let interval = setInterval(() => {
        countdown--;

        if (countdown === 0) {
            clearInterval(interval);
            gameStarted = true;
        }
    }, 1000);
}

// MOUSE CLICK TO JUMP
canvas.addEventListener("mousedown", () => {

    // Start countdown on first click
    if (!gameStarted && countdown === 3 && !gameOver) {
        startCountdown();
        return;
    }

    // Prevent jumping before countdown finishes
    if (!gameStarted) return;

    // Restart if game over
    if (gameOver) {
        restartGame();
        return;
    }

    // Jump + sound
    bird.velocity = jumpForce;
    tweetSound.currentTime = 0;
    tweetSound.play();
});

function restartGame() {
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;

    countdown = 3;
    gameStarted = false;
}

function update() {
    if (gameOver) return;

    // Freeze game until countdown finishes
    if (!gameStarted) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Bird hits floor or ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Collision detection
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x
        ) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                gameOver = true;
            }
        }

        // Score
        if (pipe.x + pipeWidth === bird.x) {
            score++;
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Countdown text
    if (!gameStarted) {
        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";

        if (countdown === 3) ctx.fillText("Ready", canvas.width / 2 - 80, canvas.height / 2);
        if (countdown === 2) ctx.fillText("Set", canvas.width / 2 - 50, canvas.height / 2);
        if (countdown === 1) ctx.fillText("Go!", canvas.width / 2 - 50, canvas.height / 2);

        return;
    }

    // Bird
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x + 15, bird.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // Pipes
    ctx.fillStyle = "#00eaff";
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    });

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.fillText("Score: " + score, 10, 40);

    if (gameOver) {
        ctx.fillStyle = "#ff4444";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Click to restart", canvas.width / 2 - 80, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
