const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let blocks = [];
let currentBlock = null;
let speed = 3;
let direction = 1;
let gameOver = false;
let heightScore = 0;

function createBaseBlock() {
    const baseWidth = 200;
    const baseX = (WIDTH - baseWidth) / 2;
    const baseY = HEIGHT - 40;

    blocks = [{
        x: baseX,
        y: baseY,
        width: baseWidth,
        height: 40
    }];
}

function createMovingBlock() {
    const last = blocks[blocks.length - 1];
    currentBlock = {
        x: 0,
        y: last.y - last.height,
        width: last.width,
        height: 40
    };
    direction = 1;
}

function resetGame() {
    gameOver = false;
    heightScore = 0;
    speed = 3;
    createBaseBlock();
    createMovingBlock();
    updateScore();
    loop();
}

function updateScore() {
    heightScore = blocks.length - 1;
    scoreEl.textContent = `Height: ${heightScore}`;
}

function dropBlock() {
    if (gameOver || !currentBlock) return;

    const last = blocks[blocks.length - 1];

    const overlapLeft = Math.max(currentBlock.x, last.x);
    const overlapRight = Math.min(currentBlock.x + currentBlock.width, last.x + last.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
        gameOver = true;
        return;
    }

    currentBlock.x = overlapLeft;
    currentBlock.width = overlapWidth;
    blocks.push({ ...currentBlock });

    updateScore();

    speed += 0.2;
    createMovingBlock();
}

function update() {
    if (gameOver) return;

    currentBlock.x += speed * direction;

    if (currentBlock.x <= 0) {
        currentBlock.x = 0;
        direction = 1;
    } else if (currentBlock.x + currentBlock.width >= WIDTH) {
        currentBlock.x = WIDTH - currentBlock.width;
        direction = -1;
    }
}

function drawBlock(block, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.shadowBlur = 0;
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    blocks.forEach((b, i) => {
        const color = `hsl(${200 + i * 10}, 80%, 60%)`;
        drawBlock(b, color);
    });

    if (currentBlock && !gameOver) {
        drawBlock(currentBlock, "#4CAF50");
    }

    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 20);
        ctx.font = "18px Arial";
        ctx.fillText(`Final height: ${heightScore}`, WIDTH / 2, HEIGHT / 2 + 10);
        ctx.fillText("Click Restart to play again", WIDTH / 2, HEIGHT / 2 + 40);
    }
}

function loop() {
    if (gameOver) {
        draw();
        return;
    }
    update();
    draw();
    requestAnimationFrame(loop);
}

canvas.addEventListener("click", dropBlock);
restartBtn.addEventListener("click", resetGame);

createBaseBlock();
createMovingBlock();
loop();
