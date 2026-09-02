let points = 0;
let clickPower = 1;

let clickUpgradeCost = 10;
let autoClickerCost = 50;

let autoClickers = 0;

const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const clickUpgradeBtn = document.getElementById("upgradeClickBtn");
const autoClickerBtn = document.getElementById("autoClickerBtn");

const clickUpgradeCostText = document.getElementById("clickUpgradeCost");
const autoClickerCostText = document.getElementById("autoClickerCost");

// Audio controls
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

let muted = false;

// Sounds
const clickSound = new Audio("click.wav");
const upgradeSound = new Audio("upgrade.wav");

// Apply volume slider changes
volumeSlider.oninput = () => {
    const vol = volumeSlider.value;
    clickSound.volume = vol;
    upgradeSound.volume = vol;
};

// Mute toggle
muteBtn.onclick = () => {
    muted = !muted;

    clickSound.muted = muted;
    upgradeSound.muted = muted;

    muteBtn.textContent = muted ? "Unmute" : "Mute";
};

// Floating +1 particles
function spawnFloat(x, y, amount) {
    const float = document.createElement("div");
    float.className = "float";
    float.textContent = `+${amount}`;
    float.style.left = x + "px";
    float.style.top = y + "px";
    document.body.appendChild(float);

    setTimeout(() => float.remove(), 800);
}

// Explosion particles
function spawnExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.className = "explosion";
        p.textContent = "+";

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30;

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        p.style.left = x + "px";
        p.style.top = y + "px";

        p.style.setProperty("--dx", dx + "px");
        p.style.setProperty("--dy", dy + "px");

        document.body.appendChild(p);

        setTimeout(() => p.remove(), 600);
    }
}

// Manual click
clickBtn.onclick = (e) => {
    points += clickPower;
    counter.textContent = points;

    if (!muted) {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    spawnFloat(e.clientX, e.clientY, clickPower);
    spawnExplosion(e.clientX, e.clientY);
};

// Upgrade click power
clickUpgradeBtn.onclick = (e) => {
    if (points >= clickUpgradeCost) {
        points -= clickUpgradeCost;
        clickPower++;

        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);

        counter.textContent = points;
        clickUpgradeCostText.textContent = clickUpgradeCost;

        if (!muted) {
            upgradeSound.currentTime = 0;
            upgradeSound.play();
        }

        spawnExplosion(e.clientX, e.clientY);
    }
};

// Buy auto-clicker
autoClickerBtn.onclick = (e) => {
    if (points >= autoClickerCost) {
        points -= autoClickerCost;
        autoClickers++;

        autoClickerCost = Math.floor(autoClickerCost * 1.7);

        counter.textContent = points;
        autoClickerCostText.textContent = autoClickerCost;

        if (!muted) {
            upgradeSound.currentTime = 0;
            upgradeSound.play();
        }

        spawnExplosion(e.clientX, e.clientY);
    }
};

// Auto-clicker loop
setInterval(() => {
    if (autoClickers > 0) {
        points += autoClickers;
        counter.textContent = points;
    }
}, 1000);
