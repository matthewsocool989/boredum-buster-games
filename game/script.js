let points = 0;
let clickPower = 1;

let upgradeCost = 10;
let autoCost = 50;

let autoClickers = 0;

const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const autoBtn = document.getElementById("autoBtn");

const upgradeCostText = document.getElementById("upgradeCost");
const autoCostText = document.getElementById("autoCost");

// Floating +1 particles
function spawnFloat(text, x, y) {
    const float = document.createElement("div");
    float.className = "float";
    float.textContent = text;
    float.style.left = x + "px";
    float.style.top = y + "px";
    document.body.appendChild(float);

    setTimeout(() => float.remove(), 800);
}

// Manual click
clickBtn.onclick = (e) => {
    points += clickPower;
    counter.textContent = points;

    spawnFloat("+" + clickPower, e.clientX, e.clientY);
};

// Upgrade click power
upgradeBtn.onclick = () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        clickPower++;

        upgradeCost = Math.floor(upgradeCost * 1.5);

        counter.textContent = points;
        upgradeCostText.textContent = upgradeCost;
    }
};

// Auto-clicker purchase
autoBtn.onclick = () => {
    if (points >= autoCost) {
        points -= autoCost;
        autoClickers++;

        autoCost = Math.floor(autoCost * 1.75);

        counter.textContent = points;
        autoCostText.textContent = autoCost;
    }
};

// Auto-clicker loop
setInterval(() => {
    if (autoClickers > 0) {
        points += autoClickers;
        counter.textContent = points;
    }
}, 1000);
