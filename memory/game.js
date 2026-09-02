const gameContainer = document.getElementById("game");
const winScreen = document.getElementById("win-screen");
const stats = document.getElementById("stats");
const restartBtn = document.getElementById("restart");

let firstTile = null;
let secondTile = null;
let lockBoard = false;
let matches = 0;
let moves = 0;

const icons = ["🍕","⭐","🔥","🎮","⚡","💎","🎲","🚀"];
let tiles = [...icons, ...icons]; // duplicate for pairs

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setupGame() {
    gameContainer.innerHTML = "";
    winScreen.classList.add("hidden");
    matches = 0;
    moves = 0;
    firstTile = null;
    secondTile = null;
    lockBoard = false;

    shuffle(tiles);

    tiles.forEach(icon => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.icon = icon;
        tile.addEventListener("click", () => flipTile(tile));
        gameContainer.appendChild(tile);
    });
}

function flipTile(tile) {
    if (lockBoard || tile === firstTile || tile.classList.contains("matched")) return;

    tile.classList.add("flipped");
    tile.textContent = tile.dataset.icon;

    if (!firstTile) {
        firstTile = tile;
        return;
    }

    secondTile = tile;
    moves++;

    checkMatch();
}

function checkMatch() {
    if (firstTile.dataset.icon === secondTile.dataset.icon) {
        firstTile.classList.add("matched");
        secondTile.classList.add("matched");
        matches++;

        resetTurn();

        if (matches === icons.length) {
            winGame();
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstTile.classList.remove("flipped");
            secondTile.classList.remove("flipped");
            firstTile.textContent = "";
            secondTile.textContent = "";
            resetTurn();
        }, 800);
    }
}

function resetTurn() {
    firstTile = null;
    secondTile = null;
    lockBoard = false;
}

function winGame() {
    winScreen.classList.remove("hidden");
    stats.textContent = `You matched all tiles in ${moves} moves!`;
}

restartBtn.addEventListener("click", setupGame);

setupGame();
