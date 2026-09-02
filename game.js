let points = 0;
let clickPower = 1;
let upgradeCost = 10;

// DOM elements
const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const upgradeCostText = document.getElementById("upgradeCost");
const timerDisplay = document.getElementById("timer");

// Click button logic
clickBtn.onclick = () => {
    points += clickPower;
    counter.textContent = points;
};

// Upgrade button logic
upgradeBtn.onclick = () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        clickPower++;
        upgradeCost = Math.floor(upgradeCost * 1.5);

        counter.textContent = points;
        upgradeCostText.textContent = upgradeCost;
    }
};

// Timer logic
let secondsPlayed = 0;

setInterval(() => {
    secondsPlayed++;

    const minutes = Math.floor(secondsPlayed / 60);
    const seconds = secondsPlayed % 60;

    timerDisplay.textContent = `Time Played: ${minutes}m ${seconds}s`;
}, 1000);
