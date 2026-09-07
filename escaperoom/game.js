const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const inventoryDiv = document.getElementById("inventory");
let inventory = [];
let selectedItem = null;

const objects = [
    { name: "door", x: 550, y: 100, w: 100, h: 250, locked: true },
    { name: "drawer", x: 100, y: 300, w: 120, h: 80, open: false },
    { name: "note", x: 130, y: 320, w: 60, h: 40, hidden: true },
    { name: "key", x: 350, y: 200, w: 30, h: 30, hidden: true }
];

function drawRoom() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
        if (obj.hidden) return;

        ctx.fillStyle = "#00eaff";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.fillText(obj.name, obj.x + 10, obj.y + 20);
    });
}

function addToInventory(name) {
    if (!inventory.includes(name)) {
        inventory.push(name);

        const item = document.createElement("div");
        item.classList.add("item");
        item.textContent = name;
        item.onclick = () => {
            selectedItem = name;
        };

        inventoryDiv.appendChild(item);
    }
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    objects.forEach(obj => {
        if (
            mx > obj.x &&
            mx < obj.x + obj.w &&
            my > obj.y &&
            my < obj.y + obj.h
        ) {
            handleObjectClick(obj);
        }
    });
});

function handleObjectClick(obj) {
    if (obj.name === "drawer") {
        obj.open = true;
        objects.find(o => o.name === "note").hidden = false;
    }

    if (obj.name === "note") {
        alert("The note says: 'The key is behind the painting.'");
        objects.find(o => o.name === "key").hidden = false;
        addToInventory("note");
        obj.hidden = true;
    }

    if (obj.name === "key") {
        addToInventory("key");
        obj.hidden = true;
    }

    if (obj.name === "door") {
        if (selectedItem === "key") {
            obj.locked = false;
            alert("You unlocked the door!");
        } else if (obj.locked) {
            alert("The door is locked.");
        } else {
            alert("You escaped!");
        }
    }
}

function gameLoop() {
    drawRoom();
    requestAnimationFrame(gameLoop);
}

gameLoop();
