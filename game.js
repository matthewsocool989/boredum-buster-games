let points = 0;
let clickPower = 1;
let upgradeCost = 10;

let autoClickers = 0;
let autoClickerCost = 50;

// DOM elements
const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const autoClickerBtn = document.getElementById("autoClickerBtn");
const upgradeCostText = document.getElementById("upgradeCost");
const autoClickerCostText = document.getElementById("autoClickerCost");
const timerDisplay = document.getElementById("timer");
const particleContainer = document.getElementById("particleContainer");

// Sound elements
const clickSound = document.getElementById("clickSound");
const upgradeSound = document.getElementById("upgradeSound");

// Sound controls
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

// AUDIO UNLOCK
document.body.addEventListener("click", () => {
    clickSound.play().catch(() => {});
    upgradeSound.play().catch(() => {});
}, { once: true });

// CLICK PARTICLE
function spawnParticle(x, y, text) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.textContent = text;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    particleContainer.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
}

// Click button logic
clickBtn.onclick = (e) => {
    points += clickPower;
    counter.textContent = points;

    clickSound.currentTime = 0;
    clickSound.play();

    spawnParticle(e.clientX, e.clientY, `+${clickPower}`);
};

// Upgrade button logic
upgradeBtn.onclick = (e) => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        clickPower++;
        upgradeCost = Math.floor(upgradeCost * 1.5);

        counter.textContent = points;
        upgradeCostText.textContent = upgradeCost;

        upgradeSound.currentTime = 0;
        upgradeSound.play();

        upgradeBtn.classList.add("flash");
        setTimeout(() => upgradeBtn.classList.remove("flash"), 300);

        spawnParticle(e.clientX, e.clientY, `+UP`);
    }
};

// AUTO‑CLICKER PURCHASE
autoClickerBtn.onclick = (e) => {
    if (points >= autoClickerCost) {
        points -= autoClickerCost;
        autoClickers++;
        autoClickerCost = Math.floor(autoClickerCost * 1.4);

        counter.textContent = points;
        autoClickerCostText.textContent = autoClickerCost;

        upgradeSound.currentTime = 0;
        upgradeSound.play();

        autoClickerBtn.classList.add("flash");
        setTimeout(() => autoClickerBtn.classList.remove("flash"), 300);

        spawnParticle(e.clientX, e.clientY, `+AC`);
    }
};

// AUTO‑CLICKER TICK
setInterval(() => {
    if (autoClickers > 0) {
        points += autoClickers;
        counter.textContent = points;

        // Spawn particle near counter
        const rect = counter.getBoundingClientRect();
        spawnParticle(
            rect.left + rect.width / 2,
            rect.top,
            `+${autoClickers}`
        );
    }
}, 1000);

// Timer logic
let secondsPlayed = 0;

setInterval(() => {
    secondsPlayed++;

    const minutes = Math.floor(secondsPlayed / 60);
    const seconds = secondsPlayed % 60;

    timerDisplay.textContent = `Time Played: ${minutes}m ${seconds}s`;
}, 1000);

// MUTE BUTTON
let isMuted = false;

muteBtn.onclick = () => {
    isMuted = !isMuted;

    clickSound.muted = isMuted;
    upgradeSound.muted = isMuted;

    muteBtn.textContent = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
};

// VOLUME SLIDER
volumeSlider.oninput = () => {
    clickSound.volume = volumeSlider.value;
    upgradeSound.volume = volumeSlider.value;
};
