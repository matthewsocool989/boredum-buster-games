const boardElement = document.getElementById("board");

let tiles = [];
const size = 4; // 4x4 grid

function createBoard() {
    tiles = generateSolvablePuzzle();

    boardElement.innerHTML = "";

    tiles.forEach((value, index) => {
        const div = document.createElement("div");
        div.classList.add("tile");

        if (value === 0) {
            div.classList.add("empty");
        } else {
            div.textContent = value;
            div.addEventListener("click", () => tryMove(index));
        }

        boardElement.appendChild(div);
    });
}

function tryMove(index) {
    const emptyIndex = tiles.indexOf(0);

    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
        // swap
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
        createBoard();
        checkWin();
    }
}

function getValidMoves(emptyIndex) {
    const moves = [];
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    if (row > 0) moves.push(emptyIndex - size);     // up
    if (row < size - 1) moves.push(emptyIndex + size); // down
    if (col > 0) moves.push(emptyIndex - 1);        // left
    if (col < size - 1) moves.push(emptyIndex + 1); // right

    return moves;
}

function checkWin() {
    for (let i = 0; i < 15; i++) {
        if (tiles[i] !== i + 1) return;
    }

    alert("You Win!");
}

function generateSolvablePuzzle() {
    let arr = [...Array(16).keys()]; // 0–15
    arr = arr.map(n => (n === 0 ? 0 : n)); // 0 is empty

    // shuffle
    do {
        arr = arr.sort(() => Math.random() - 0.5);
    } while (!isSolvable(arr));

    return arr;
}

function isSolvable(arr) {
    let inversions = 0;

    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] && arr[j] && arr[i] > arr[j]) {
                inversions++;
            }
        }
    }

    const emptyRow = Math.floor(arr.indexOf(0) / size);

    // solvability rule for 4x4 grid
    return (inversions + emptyRow) % 2 === 0;
}

createBoard();
