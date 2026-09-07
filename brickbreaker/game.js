const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 40,
    speed: 6,
    dx: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4
};

const brickRows = 5;
const brickCols = 7;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 25;

let bricks = [];
let gameOver = false;
let gameWon = false;

function createBricks() {
    bricks = [];
    for (let r = 0; r < brickRows; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickCols; c++) {
            bricks[r][c] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                destroyed: false
            };
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = "#00eaff";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00eaff";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (!brick.destroyed) {
                ctx.fillStyle = "#00ff88";
                ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
            }
        });
    });
}

function movePaddle() {
    paddle.x += paddle.dx;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width)
        paddle.x = canvas.width - paddle.width;
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width)
        ball.dx *= -1;

    if (ball.y - ball.radius < 0)
        ball.dy *= -1;

    // Paddle collision
    if (
        ball.y + ball.radius >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
    ) {
        ball.dy *= -1;

        // Add angle based on where it hits the paddle
        let hitPoint = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = hitPoint * 0.1;
    }

    // Bottom = lose
    if (ball.y - ball.radius > canvas.height) {
        gameOver = true;
    }

    // Brick collisions
    bricks.forEach(row => {
        row.forEach(brick => {
            if (!brick.destroyed) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight
                ) {
                    brick.destroyed = true;
                    ball.dy *= -1;

                    checkWin();
                }
            }
        });
    });
}

function checkWin() {
    let remaining = 0;
    bricks.forEach(row => {
        row.forEach(brick => {
            if (!brick.destroyed) remaining++;
        });
    });

    if (remaining === 0) {
        gameWon = true;
    }
}

function drawText() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";

    if (gameOver) {
        ctx.fillText("Game Over!", canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText("Press R to restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
    }

    if (gameWon) {
        ctx.fillText("You Win!", canvas.width / 2 - 50, canvas.height / 2);
        ctx.fillText("Press R to restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
    }
}

function update() {
    if (!gameOver && !gameWon) {
        movePaddle();
        moveBall();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBall();
    drawText();

    requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "a") paddle.dx = -paddle.speed;
    if (e.key.toLowerCase() === "d") paddle.dx = paddle.speed;

    if (e.key.toLowerCase() === "r" && (gameOver || gameWon)) {
        resetGame();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key.toLowerCase() === "a" || e.key.toLowerCase() === "d") {
        paddle.dx = 0;
    }
});

function resetGame() {
    paddle.x = canvas.width / 2 - paddle.width / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4;
    ball.dy = -4;

    gameOver = false;
    gameWon = false;

    createBricks();
}

createBricks();
update();
