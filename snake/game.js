const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 },
];

let velocity = { x: 1, y: 0 };
let food = { x: 5, y: 5 };
let gameOver = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && velocity.y !== 1) velocity = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && velocity.y !== -1) velocity = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && velocity.x !== 1) velocity = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && velocity.x !== -1) velocity = { x: 1, y: 0 };
});

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 1, y: 0 };
    food = { x: 5, y: 5 };
    gameOver = false;
}

function update() {
    if (gameOver) return;

    // Move snake head
    const head = {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y
    };

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } else {
        snake.pop();
    }

    // Wall collision
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount
    ) {
        gameOver = true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
        }
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = "#00eaff";
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press any key to restart", canvas.width / 2 - 110, canvas.height / 2 + 40);
    }
}

document.addEventListener("keydown", () => {
    if (gameOver) resetGame();
});

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100);
}

gameLoop();
