const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const inventoryDiv = document.getElementById("inventory");
const storyDiv = document.getElementById("story");

let inventory = [];
let draggingItem = null;
let draggingOffset = { x: 0, y: 0 };

let flashlightOn = false;
let doorOpenAnim = 0;
let escaped = false;

const rooms = [
    {
        name: "Room 1",
        description: "You wake up in a dim neon room. The door is locked. A drawer and a painting catch your eye.",
        objects: [
            { id: "door", name: "Door", x: 550, y: 100, w: 100, h: 250, locked: true, type: "door" },
            { id: "drawer", name: "Drawer", x: 80, y: 300, w: 140, h: 80, open: false, type: "container" },
            { id: "painting", name: "Painting", x: 300, y: 120, w: 120, h: 80, type: "painting", moved: false },
            { id: "note", name: "Note", x: 100, y: 320, w: 60, h: 40, hidden: true, type: "pickup" },
            { id: "key", name: "Key", x: 330, y: 150, w: 30, h: 30, hidden: true, type: "pickup" }
        ]
    },
    {
        name: "Room 2",
        description: "You step into a second room. A locked box sits on a table. A strange keypad glows on the wall.",
        objects: [
            { id: "box", name: "Box", x: 150, y: 260, w: 120, h: 80, locked: true, type: "box" },
            { id: "keypad", name: "Keypad", x: 500, y: 180, w: 80, h: 80, type: "keypad", solved: false },
            { id: "flashlight", name: "Flashlight", x: 180, y: 280, w: 40, h: 40, hidden: true, type: "pickup" },
            { id: "compartment", name: "Compartment", x: 350, y: 260, w: 80, h: 60, hidden: true, type: "compartment", open: false },
            { id: "finalkey", name: "Final Key", x: 370, y: 280, w: 40, h: 40, hidden: true, type: "pickup" }
        ]
    }
];

let currentRoomIndex = 0;

function setStory(text) {
    storyDiv.textContent = text;
}

function drawRoom() {
    ctx.fillStyle = flashlightOn ? "#222" : "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const room = rooms[currentRoomIndex];

    room.objects.forEach(obj => {
        if (obj.hidden) return;

        ctx.save();

        if (!flashlightOn && obj.type !== "door") {
            ctx.globalAlpha = 0.4;
        }

        ctx.fillStyle = "#00eaff";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(obj.name, obj.x + 8, obj.y + 20);

        ctx.restore();
    });

    if (doorOpenAnim > 0) {
        ctx.save();
        ctx.fillStyle = "#00ff88";
        ctx.globalAlpha = doorOpenAnim / 20;
        ctx.fillRect(550, 100, 100, 250);
        ctx.restore();
        doorOpenAnim--;
    }

    if (escaped) {
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText("You Escaped!", canvas.width / 2 - 110, canvas.height / 2);
    }
}

function addToInventory(name) {
    if (!inventory.includes(name)) {
        inventory.push(name);

        const item = document.createElement("div");
        item.classList.add("item");
        item.textContent = name;

        item.addEventListener("mousedown", (e) => {
            draggingItem = item;
            item.classList.add("dragging");
            draggingOffset.x = e.offsetX;
            draggingOffset.y = e.offsetY;
        });

        inventoryDiv.appendChild(item);
    }
}

canvas.addEventListener("click", (e) => {
    if (escaped) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const room = rooms[currentRoomIndex];

    room.objects.forEach(obj => {
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
    const room = rooms[currentRoomIndex];

    if (obj.id === "drawer") {
        obj.open = true;
        const note = room.objects.find(o => o.id === "note");
        if (note) note.hidden = false;
        setStory("You opened the drawer. There's a note inside.");
    }

    if (obj.id === "note") {
        alert("The note says: 'Behind the painting lies the key.'");
        addToInventory("Note");
        obj.hidden = true;
        const key = room.objects.find(o => o.id === "key");
        if (key) key.hidden = false;
        setStory("You pocket the note. The painting looks suspicious.");
    }

    if (obj.id === "painting") {
        obj.moved = true;
        const key = room.objects.find(o => o.id === "key");
        if (key) key.hidden = false;
        setStory("You move the painting and reveal a hidden key.");
    }

    if (obj.id === "key") {
        addToInventory("Key");
        obj.hidden = true;
        setStory("You picked up a small brass key.");
    }

    if (obj.id === "door") {
        if (currentRoomIndex === 0) {
            if (inventory.includes("Key")) {
                obj.locked = false;
                doorOpenAnim = 20;
                setStory("You unlock the door and step into the next room.");
                setTimeout(() => {
                    currentRoomIndex = 1;
                    setStory(rooms[1].description);
                }, 600);
            } else {
                alert("The door is locked. You need a key.");
            }
        } else {
            if (inventory.includes("Final Key")) {
                obj.locked = false;
                doorOpenAnim = 20;
                setStory("You unlock the final door. Freedom awaits.");
                setTimeout(() => {
                    escaped = true;
                }, 600);
            } else {
                alert("This door is locked with a different key.");
            }
        }
    }

    if (obj.id === "box") {
        if (!obj.locked) {
            const flashlight = rooms[1].objects.find(o => o.id === "flashlight");
            if (flashlight) flashlight.hidden = false;
            setStory("You open the box and find a flashlight.");
        } else {
            alert("The box is locked. Maybe the keypad controls it.");
        }
    }

    if (obj.id === "keypad") {
        const code = prompt("Enter 3-digit code:");
        if (code === "314") {
            obj.solved = true;
            const box = rooms[1].objects.find(o => o.id === "box");
            if (box) box.locked = false;
            const compartment = rooms[1].objects.find(o => o.id === "compartment");
            if (compartment) compartment.hidden = false;
            setStory("The keypad beeps. The box unlocks and a hidden compartment slides open.");
        } else {
            alert("Incorrect code.");
        }
    }

    if (obj.id === "flashlight") {
        addToInventory("Flashlight");
        obj.hidden = true;
        setStory("You picked up the flashlight. Maybe it reveals something in the dark.");
    }

    if (obj.id === "compartment") {
        obj.open = true;
        const finalKey = rooms[1].objects.find(o => o.id === "finalkey");
        if (finalKey) finalKey.hidden = false;
        setStory("Inside the compartment, you see a final key.");
    }

    if (obj.id === "finalkey") {
        addToInventory("Final Key");
        obj.hidden = true;
        setStory("You pocket the final key. The exit door calls to you.");
    }
}

canvas.addEventListener("mousemove", (e) => {
    if (!draggingItem) return;

    const rect = inventoryDiv.getBoundingClientRect();
    draggingItem.style.position = "absolute";
    draggingItem.style.left = e.clientX - draggingOffset.x + "px";
    draggingItem.style.top = e.clientY - draggingOffset.y + "px";
});

document.addEventListener("mouseup", (e) => {
    if (!draggingItem) return;

    const rectCanvas = canvas.getBoundingClientRect();
    const mx = e.clientX - rectCanvas.left;
    const my = e.clientY - rectCanvas.top;

    if (
        mx >= 0 && mx <= canvas.width &&
        my >= 0 && my <= canvas.height
    ) {
        useItemOnPosition(draggingItem.textContent, mx, my);
    }

    draggingItem.classList.remove("dragging");
    draggingItem.style.position = "relative";
    draggingItem.style.left = "";
    draggingItem.style.top = "";
    draggingItem = null;
});

function useItemOnPosition(itemName, x, y) {
    const room = rooms[currentRoomIndex];

    const obj = room.objects.find(o =>
        !o.hidden &&
        x > o.x &&
        x < o.x + o.w &&
        y > o.y &&
        y < o.y + o.h
    );

    if (!obj) return;

    if (itemName === "Flashlight") {
        flashlightOn = true;
        setStory("You turn on the flashlight. The room becomes clearer.");
    }

    if (itemName === "Key" && obj.id === "door" && currentRoomIndex === 0) {
        obj.locked = false;
        doorOpenAnim = 20;
        setStory("You unlock the door with the key and move on.");
        setTimeout(() => {
            currentRoomIndex = 1;
            setStory(rooms[1].description);
        }, 600);
    }

    if (itemName === "Final Key" && obj.id === "door" && currentRoomIndex === 1) {
        obj.locked = false;
        doorOpenAnim = 20;
        setStory("You unlock the final door. You are free.");
        setTimeout(() => {
            escaped = true;
        }, 600);
    }
}

function gameLoop() {
    drawRoom();
    requestAnimationFrame(gameLoop);
}

setStory(rooms[0].description);
gameLoop();
