let points = 0;
let clickPower = 1;
let upgradeCost = 10;

// DOM elements
const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const upgradeCostText = document.getElementById("upgradeCost");
const timerDisplay = document.getElementById("timer");

// Sound elements
const clickSound = document.getElementById("clickSound");
const upgradeSound = document.getElementById("upgradeSound");

// Sound controls
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

// AUDIO UNLOCK (fixes browser autoplay restrictions)
document.body.addEventListener("click", () => {
    clickSound.play().catch(() => {});
    upgradeSound.play().catch(() => {});
}, { once: true });

// Click button logic
clickBtn.onclick = () => {
    points += clickPower;
    counter.textContent = points;

    clickSound.currentTime = 0;
    clickSound.play();
};

// Upgrade button logic
upgradeBtn.onclick = () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        clickPower++;
        upgradeCost = Math.floor(upgradeCost * 1.5);

        counter.textContent = points;
        upgradeCostText.textContent = upgradeCost;

        upgradeSound.currentTime = 0;
        upgradeSound.play();
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
