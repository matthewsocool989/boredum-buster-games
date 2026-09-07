const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const inventoryDiv = document.getElementById("inventory");
const storyDiv = document.getElementById("story");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const viewLabel = document.getElementById("viewLabel");

let inventory = [];
let selectedItem = null;
let escaped = false;

// Views: 0 = Front, 1 = Left, 2 = Back, 3 = Right
let currentView = 0;

const views = [
    { name: "Front Wall" },
    { name: "Left Wall" },
    { name: "Back Wall" },
    { name: "Right Wall" }
];

const objects = [
    // Front wall: door, painting
    { id: "door", view: 0, name: "Door", x: 500, y: 120, w: 120, h: 220, type: "door", locked: true },
    { id: "painting", view: 0, name: "Painting", x: 200, y: 120, w: 120, h: 90, type: "painting", moved: false },

    // Left wall: drawer, note
    { id: "drawer", view: 1, name: "Drawer", x: 120, y: 260, w: 140, h: 80, type: "drawer", open: false },
    { id: "note", view: 1, name: "Note", x: 150, y: 280, w: 80, h: 40, type: "pickup", hidden: true },

    // Back wall: keypad, box
    { id: "keypad", view: 2, name: "Keypad", x: 480, y: 180, w: 80, h: 80, type: "keypad", solved: false },
    { id: "box", view: 2, name: "Box", x: 180, y: 260, w: 120, h: 80, type: "box", locked: true },

    // Right wall: compartment, final door
    { id: "compartment", view: 3, name: "Compartment", x: 200, y: 220, w: 100, h: 70, type: "compartment", hidden: true, open: false },
    { id: "finaldoor", view: 3, name: "Exit Door", x: 480, y: 120, w: 120, h: 220, type: "finaldoor", locked: true },

    // Hidden items (no view, appear on walls when revealed)
    { id: "key", view: 0, name: "Key", x: 230, y: 150, w: 40, h: 40, type: "pickup", hidden: true },
    { id: "flashlight", view: 2, name: "Flashlight", x: 210, y: 280, w: 40, h: 40, type: "pickup", hidden: true },
    { id: "finalkey", view: 3, name: "Final Key", x: 220, y: 240, w: 40, h: 40, type: "pickup", hidden: true }
];

function setStory(text) {
    storyDiv.textContent = text;
}

function drawView() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple fake 3D wall gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#050505");
    grad.addColorStop(1, "#101010");
    ctx.fillStyle = grad;
    ctx.fillRect(50, 50, 600, 350);

    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 600, 350);

    // Floor line
    ctx.strokeStyle = "#00eaff";
    ctx.beginPath();
    ctx.moveTo(50, 320);
    ctx.lineTo(650, 350);
    ctx.stroke();

    // Draw objects on current view
    objects.forEach(obj => {
        if (obj.view !== currentView) return;
        if (obj.hidden) return;

        ctx.fillStyle = "#00eaff";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(obj.name, obj.x + 8, obj.y + 20);
    });

    if (escaped) {
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText("You Escaped!", canvas.width / 2 - 110, canvas.height / 2);
    }

    viewLabel.textContent = views[currentView].name;
}

function addToInventory(name) {
    if (!inventory.includes(name)) {
        inventory.push(name);

        const item = document.createElement("div");
        item.classList.add("item");
        item.textContent = name;

        item.addEventListener("click", () => {
            selectedItem = name;
            document.querySelectorAll(".item").forEach(i => i.classList.remove("selected"));
            item.classList.add("selected");
        });

        inventoryDiv.appendChild(item);
    }
}

canvas.addEventListener("click", (e) => {
    if (escaped) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const obj = objects.find(o =>
        o.view === currentView &&
        !o.hidden &&
        mx > o.x &&
        mx < o.x + o.w &&
        my > o.y &&
        my < o.y + o.h
    );

    if (!obj) return;

    if (selectedItem) {
        useItemOnObject(selectedItem, obj);
    } else {
        handleObjectClick(obj);
    }
});

function handleObjectClick(obj) {
    if (obj.id === "drawer") {
        obj.open = true;
        const note = objects.find(o => o.id === "note");
        if (note) note.hidden = false;
        setStory("You open the drawer and find a note.");
    }

    if (obj.id === "note") {
        alert("The note says: 'The key is behind the painting.'");
        addToInventory("Note");
        obj.hidden = true;
        const key = objects.find(o => o.id === "key");
        if (key) key.hidden = false;
        setStory("You pocket the note. The painting looks suspicious.");
    }

    if (obj.id === "painting") {
        obj.moved = true;
        const key = objects.find(o => o.id === "key");
        if (key) key.hidden = false;
        setStory("You move the painting and reveal a hidden key.");
    }

    if (obj.id === "key") {
        addToInventory("Key");
        obj.hidden = true;
        setStory("You picked up a small brass key.");
    }

    if (obj.id === "door") {
        if (obj.locked) {
            setStory("The door is locked. You need a key.");
        } else {
            setStory("You step through the door. Maybe there's another way out...");
        }
    }

    if (obj.id === "box") {
        if (obj.locked) {
            setStory("The box is locked. Maybe the keypad controls it.");
        } else {
            const flashlight = objects.find(o => o.id === "flashlight");
            if (flashlight) flashlight.hidden = false;
            setStory("You open the box and find a flashlight.");
        }
    }

    if (obj.id === "keypad") {
        const code = prompt("Enter 3-digit code:");
        if (code === "314") {
            obj.solved = true;
            const box = objects.find(o => o.id === "box");
            if (box) box.locked = false;
            const compartment = objects.find(o => o.id === "compartment");
            if (compartment) compartment.hidden = false;
            setStory("The keypad beeps. The box unlocks and a hidden compartment opens on the right wall.");
        } else {
            alert("Incorrect code.");
        }
    }

    if (obj.id === "compartment") {
        obj.open = true;
        const finalKey = objects.find(o => o.id === "finalkey");
        if (finalKey) finalKey.hidden = false;
        setStory("Inside the compartment, you see a final key.");
    }

    if (obj.id === "finalkey") {
        addToInventory("Final Key");
        obj.hidden = true;
        setStory("You pocket the final key. The exit door looks promising.");
    }

    if (obj.id === "finaldoor") {
        if (obj.locked) {
            setStory("The exit door is locked. You need the final key.");
        } else {
            escaped = true;
            setStory("You unlock the exit door and step out. You escaped!");
        }
    }

    if (obj.id === "flashlight") {
        addToInventory("Flashlight");
        obj.hidden = true;
        setStory("You picked up the flashlight. Maybe it helps reveal hidden clues.");
    }
}

function useItemOnObject(itemName, obj) {
    if (itemName === "Key" && obj.id === "door") {
        obj.locked = false;
        setStory("You unlock the door with the key. Maybe there's more beyond...");
    }

    if (itemName === "Flashlight" && obj.id === "keypad") {
        alert("You shine the flashlight near the keypad. You notice scratches: 3, 1, 4.");
        setStory("The flashlight reveals faint scratches near the keypad: 3, 1, 4.");
    }

    if (itemName === "Final Key" && obj.id === "finaldoor") {
        obj.locked = false;
        setStory("You unlock the exit door with the final key.");
    }
}

leftBtn.addEventListener("click", () => {
    currentView = (currentView + 3) % 4;
    drawView();
});

rightBtn.addEventListener("click", () => {
    currentView = (currentView + 1) % 4;
    drawView();
});

function gameLoop() {
    drawView();
    requestAnimationFrame(gameLoop);
}

setStory("You wake up in a neon room. The front wall has a door and a painting. Explore each wall and find a way out.");
gameLoop();
