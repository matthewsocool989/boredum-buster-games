let points = 0;
let clickPower = 1;
let upgradeCost = 10;

const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const upgradeCostText = document.getElementById("upgradeCost");

clickBtn.onclick = () => {
    points += clickPower;
    counter.textContent = points;
};

upgradeBtn.onclick = () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        clickPower++;
        upgradeCost = Math.floor(upgradeCost * 1.5);

        counter.textContent = points;
        upgradeCostText.textContent = upgradeCost;
    }
};
