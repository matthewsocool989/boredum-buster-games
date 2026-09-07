// Mystery — action/thriller choose-your-own game
// ~10 minute playtime via branching paths and multiple endings

const sceneTitleEl = document.getElementById("scene-title");
const sceneTextEl = document.getElementById("scene-text");
const choicesEl = document.getElementById("choices");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");
const logEl = document.getElementById("log");

let mysteryState = {
    currentSceneId: "intro",
    startedAt: Date.now(),
    flags: {
        hasKeycard: false,
        trustedAgent: false,
        accessedServer: false,
        rooftopReady: false,
        wounded: false,
        timePressure: false
    },
    history: []
};

const TOTAL_TIME_MINUTES = 10;
const TOTAL_TIME_MS = TOTAL_TIME_MINUTES * 60 * 1000;

const scenes = {
    intro: {
        title: "01: The Call",
        text: `It’s 11:47 PM. The city outside your apartment window is a grid of neon and rain.
Your phone buzzes — an encrypted channel you only use for one thing: off-the-books work.

A distorted voice comes through: 
"We have a situation at Helix Tower. A data leak. A hostile extraction team is inbound. 
You’re the closest asset. Get in, secure the drive, and get out. You have ten minutes before they arrive."

You grab your jacket, your encrypted wristband, and head for the door.`,
        choices: [
            {
                text: "Head straight to Helix Tower. No backup, no delay.",
                next: "street",
                effects: (state) => {
                    state.flags.timePressure = true;
                    addLog("You chose speed over backup. Time pressure increases.");
                }
            },
            {
                text: "Call your contact, Agent Vega, for intel before moving.",
                next: "vega_call",
                effects: (state) => {
                    state.flags.trustedAgent = true;
                    addLog("You loop Agent Vega in. You’re not alone in this.");
                }
            }
        ]
    },

    vega_call: {
        title: "02: Intel First",
        text: `You patch Vega into the call. Her voice is sharp, focused.

"Helix Tower’s security is running on a skeleton crew tonight. 
Main entrance is watched, but the service access on 3rd Street is blind for another fifteen minutes."

She pauses.

"There’s also chatter about a rival team. They’re not subtle. If you hear gunfire, you’re already late."

She sends you a live building layout to your wristband.`,
        choices: [
            {
                text: "Take Vega’s advice and use the service access.",
                next: "service_alley",
                effects: (state) => {
                    addLog("You trust Vega’s intel and head for the service alley.");
                }
            },
            {
                text: "Ignore the advice. You prefer the main entrance — more direct.",
                next: "street",
                effects: (state) => {
                    addLog("You ignore Vega’s route and go for the main entrance.");
                }
            }
        ]
    },

    street: {
        title: "03: Main Approach",
        text: `You cut through the wet streets toward Helix Tower’s front plaza.
The building looms above — glass, steel, and corporate secrets.

Two security guards stand near the revolving doors, bored but alert.
Your wristband pings: "External cameras active. Lobby scanners online."`,
        choices: [
            {
                text: "Blend in as a late-night employee and walk toward the doors.",
                next: "lobby_confront",
                effects: (state) => {
                    addLog("You choose to bluff your way through the front.");
                }
            },
            {
                text: "Circle around the block, looking for a side access.",
                next: "service_alley",
                effects: (state) => {
                    addLog("You decide the front is too hot and look for another way.");
                }
            }
        ]
    },

    service_alley: {
        title: "04: Service Alley",
        text: `You slip into the narrow alley behind Helix Tower.
The hum of generators and the smell of oil fill the air.

A metal door marked "Service Access" sits under a flickering light.
Next to it: a card reader and a small, cracked security panel.`,
        choices: [
            {
                text: "Try to bypass the panel with your wristband’s exploit tools.",
                next: "panel_hack",
                effects: (state) => {
                    addLog("You hook your wristband into the panel and start a quick hack.");
                }
            },
            {
                text: "Look around for a dropped or forgotten keycard.",
                next: "find_keycard",
                effects: (state) => {
                    addLog("You search the alley for physical access.");
                }
            }
        ]
    },

    find_keycard: {
        title: "05: Lost Access",
        text: `You scan the ground, the trash bins, the ledges.
Behind a stack of crates, you spot a lanyard — Helix Tower branding, still intact.

The keycard clipped to it is scuffed but functional.`,
        choices: [
            {
                text: "Take the keycard and use it on the service door.",
                next: "service_entry",
                effects: (state) => {
                    state.flags.hasKeycard = true;
                    addLog("You pocket the keycard. Physical access acquired.");
                }
            },
            {
                text: "Ignore the card. You don’t trust abandoned access credentials.",
                next: "panel_hack",
                effects: (state) => {
                    addLog("You leave the card. If it’s bait, you’re not biting.");
                }
            }
        ]
    },

    panel_hack: {
        title: "06: Quick Hack",
        text: `You connect your wristband to the cracked panel.
Lines of code scroll across your display as you brute-force the access token.

A progress bar ticks upward. 40%… 70%… 90%…

You hear distant sirens. Time is not on your side.`,
        choices: [
            {
                text: "Wait for the hack to finish.",
                next: "service_entry",
                effects: (state) => {
                    state.flags.timePressure = true;
                    addLog("You commit to the hack. Every second counts.");
                }
            },
            {
                text: "Abort the hack and move to the main entrance instead.",
                next: "street",
                effects: (state) => {
                    addLog("You decide the hack is taking too long and relocate.");
                }
            }
        ]
    },

    service_entry: {
        title: "07: Inside the Veins",
        text: `The service door clicks open.
You slip inside, into a dim corridor lined with pipes and maintenance lockers.

Your wristband map shows two routes:
- Up the service stairs to the 14th floor server room.
- Across the maintenance hall to the freight elevator.`,
        choices: [
            {
                text: "Take the service stairs — quieter, but slower.",
                next: "stairs_encounter",
                effects: (state) => {
                    addLog("You choose the stairs. Less noise, more effort.");
                }
            },
            {
                text: "Use the freight elevator — faster, but risk detection.",
                next: "elevator_ride",
                effects: (state) => {
                    state.flags.timePressure = true;
                    addLog("You choose speed. The elevator hums to life.");
                }
            }
        ]
    },

    lobby_confront: {
        title: "08: Lobby Check",
        text: `You stride toward the revolving doors, shoulders squared.
One of the guards steps forward, scanning you.

"Badge?" he asks.

Your wristband quietly flashes a warning: "No valid employee profile found."`,
        choices: [
            {
                text: "Bluff: claim you’re a contractor called in for an emergency.",
                next: "lobby_bluff",
                effects: (state) => {
                    addLog("You lean into the bluff, hoping the guard buys it.");
                }
            },
            {
                text: "Abort and retreat before things escalate.",
                next: "street",
                effects: (state) => {
                    addLog("You back off before the situation hardens.");
                }
            }
        ]
    },

    lobby_bluff: {
        title: "09: Contractor Story",
        text: `"Server anomaly on 14. I’m the only one on call," you say, keeping your voice flat.

The guard hesitates, glancing at his tablet.
He taps a few times, frowns, then shrugs.

"Fine. Just sign in at the desk. And don’t touch anything you’re not supposed to."

You’re in the lobby, but eyes are on you.`,
        choices: [
            {
                text: "Head straight for the elevators, ignoring the sign-in desk.",
                next: "elevator_ride",
                effects: (state) => {
                    addLog("You walk past the desk like you belong here.");
                }
            },
            {
                text: "Play it safe and sign in, hoping to avoid suspicion.",
                next: "sign_in",
                effects: (state) => {
                    addLog("You decide to leave a paper trail. Risky, but less immediate heat.");
                }
            }
        ]
    },

    sign_in: {
        title: "10: Paper Trail",
        text: `You sign in with a fake name.
The receptionist barely looks at you, stamping the log.

Your wristband pings: "System cross-check in progress."

You’ve bought short-term safety at the cost of long-term exposure.`,
        choices: [
            {
                text: "Move quickly to the elevators before the system flags you.",
                next: "elevator_ride",
                effects: (state) => {
                    state.flags.timePressure = true;
                    addLog("You hurry away from the desk. The system is catching up.");
                }
            }
        ]
    },

    stairs_encounter: {
        title: "11: Stairwell Echoes",
        text: `You climb the narrow service stairs.
Your footsteps echo against concrete.

Halfway up, you hear voices above — two people arguing.
Words drift down: "…extraction team… drive… rooftop rendezvous…"`,
        choices: [
            {
                text: "Slow down and listen carefully from the shadows.",
                next: "intel_scene",
                effects: (state) => {
                    addLog("You pause, gathering intel before moving.");
                }
            },
            {
                text: "Push past them quickly, hoping they don’t notice.",
                next: "stairs_rush",
                effects: (state) => {
                    state.flags.wounded = true;
                    addLog("You rush forward. Things are about to get messy.");
                }
            }
        ]
    },

    intel_scene: {
        title: "12: Overheard Plans",
        text: `You stay just out of sight, listening.

"They’ll hit the server room first," one voice says.
"The drive’s on 14. If they miss it, they’ll try the rooftop backup."

You now know: server room and rooftop are both critical.`,
        choices: [
            {
                text: "Head to the server room on 14 to secure the primary drive.",
                next: "server_room",
                effects: (state) => {
                    addLog("You prioritize the server room. Primary objective.");
                }
            },
            {
                text: "Skip the server room and go straight for the rooftop backup.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.rooftopReady = true;
                    addLog("You gamble on the rooftop backup being untouched.");
                }
            }
        ]
    },

    stairs_rush: {
        title: "13: Collision Course",
        text: `You push up the stairs, rounding the corner too fast.

You collide with one of the arguing operatives.
He stumbles, curses, and reaches for something under his jacket.

You react on instinct.`,
        choices: [
            {
                text: "Shove him hard into the railing and keep moving.",
                next: "server_room",
                effects: (state) => {
                    state.flags.wounded = true;
                    addLog("You force your way past, catching a glancing hit in the process.");
                }
            },
            {
                text: "Back off, apologize, and try to play it off.",
                next: "intel_scene",
                effects: (state) => {
                    addLog("You de-escalate and slip back into the shadows.");
                }
            }
        ]
    },

    elevator_ride: {
        title: "14: Vertical Risk",
        text: `You step into the elevator.
The doors slide shut with a soft hiss.

You select floor 14. The elevator hums upward.

Halfway there, the lights flicker. Your wristband flashes: "External interference detected."`,
        choices: [
            {
                text: "Override the elevator controls and force a manual stop on 14.",
                next: "server_room",
                effects: (state) => {
                    addLog("You force the elevator to obey. 14th floor, ready or not.");
                }
            },
            {
                text: "Ride it out and see where the interference takes you.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.rooftopReady = true;
                    addLog("You let the interference redirect you. The rooftop awaits.");
                }
            }
        ]
    },

    server_room: {
        title: "15: Core Access",
        text: `You step into the 14th floor server room.
Rows of humming racks stretch into the darkness.

Your wristband highlights a single terminal: "Primary drive slot."

You’re not alone. Footsteps echo behind you.`,
        choices: [
            {
                text: "Rush to the terminal and start the data extraction.",
                next: "server_hack",
                effects: (state) => {
                    state.flags.accessedServer = true;
                    addLog("You prioritize the data. Extraction begins.");
                }
            },
            {
                text: "Hide behind a rack and wait to see who entered.",
                next: "server_shadow",
                effects: (state) => {
                    addLog("You choose patience over speed, watching from cover.");
                }
            }
        ]
    },

    server_hack: {
        title: "16: Data Pull",
        text: `You slot your wristband into the terminal.
Encrypted data streams across your display.

Progress: 20%… 45%… 80%…

A shadow falls across the screen. Someone is behind you.`,
        choices: [
            {
                text: "Spin around, ready to fight if needed.",
                next: "vega_reveal",
                effects: (state) => {
                    addLog("You turn to face the unknown presence.");
                }
            },
            {
                text: "Ignore them and focus on finishing the extraction.",
                next: "server_interrupt",
                effects: (state) => {
                    addLog("You commit to the hack, trusting your back to luck.");
                }
            }
        ]
    },

    server_shadow: {
        title: "17: Watching",
        text: `You stay hidden, watching the doorway.

A familiar silhouette steps in — Agent Vega.

She scans the room, then speaks quietly:
"Good. You made it. The rival team is en route. We need that drive now."`,
        choices: [
            {
                text: "Reveal yourself and work with Vega on the extraction.",
                next: "vega_reveal",
                effects: (state) => {
                    state.flags.trustedAgent = true;
                    addLog("You step out of the shadows and join Vega.");
                }
            },
            {
                text: "Stay hidden. You’re not sure you trust anyone tonight.",
                next: "server_interrupt",
                effects: (state) => {
                    addLog("You keep your distance. Trust is a luxury.");
                }
            }
        ]
    },

    vega_reveal: {
        title: "18: Partnership",
        text: `You and Vega work the terminal together.
She feeds in an override key, accelerating the extraction.

"Rooftop team is inbound," she says. "Once we have the drive, we move up."

The progress bar hits 100%. The primary drive is secured.`,
        choices: [
            {
                text: "Take the drive and head for the rooftop with Vega.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.rooftopReady = true;
                    addLog("You and Vega move as a unit toward the final rendezvous.");
                }
            },
            {
                text: "Split from Vega and take a separate route out.",
                next: "solo_escape_attempt",
                effects: (state) => {
                    addLog("You decide to go solo, even with the drive in hand.");
                }
            }
        ]
    },

    server_interrupt: {
        title: "19: Interrupted",
        text: `You ignore the presence behind you.

A gunshot cracks the air. The terminal sparks.
Your wristband flashes: "Extraction incomplete. Partial data secured."

You dive for cover as another shot rings out.`,
        choices: [
            {
                text: "Grab whatever data you can and sprint for the rooftop.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.rooftopReady = true;
                    state.flags.wounded = true;
                    addLog("You escape with partial data and a fresh wound.");
                }
            },
            {
                text: "Try to fight back and neutralize the shooter.",
                next: "fight_scene",
                effects: (state) => {
                    addLog("You choose confrontation over retreat.");
                }
            }
        ]
    },

    fight_scene: {
        title: "20: Close Quarters",
        text: `You lunge from cover, tackling the shooter.
The two of you crash into a rack, cables snapping.

You manage to disarm them, but not before taking a hard hit to the ribs.

You’re alive, but slower now.`,
        choices: [
            {
                text: "Leave them unconscious and head for the rooftop.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.wounded = true;
                    state.flags.rooftopReady = true;
                    addLog("You win the fight, but your body pays the price.");
                }
            }
        ]
    },

    rooftop_approach: {
        title: "21: Rooftop Edge",
        text: `You emerge onto the rooftop.
Wind whips across the helipad, carrying the distant sound of sirens.

A sleek black helicopter hovers nearby, searchlight sweeping.
On the far side of the roof, figures move — the rival extraction team.`,
        choices: [
            {
                text: "Signal the helicopter — it might be your ride.",
                next: "heli_choice",
                effects: (state) => {
                    addLog("You wave toward the helicopter, betting it’s friendly.");
                }
            },
            {
                text: "Stay low and move along the shadows toward the rival team.",
                next: "rival_team_scene",
                effects: (state) => {
                    addLog("You choose stealth over spectacle.");
                }
            }
        ]
    },

    heli_choice: {
        title: "22: Air Support",
        text: `The helicopter dips lower.
A voice crackles over your wristband: "Asset confirmed. Do you have the drive?"

You glance at the rival team closing in.`,
        choices: [
            {
                text: "Confirm you have the drive and request immediate extraction.",
                next: "ending_clean",
                effects: (state) => {
                    addLog("You secure an airlift, prioritizing mission success.");
                }
            },
            {
                text: "Lie. Claim you don’t have it yet to buy time.",
                next: "rival_team_scene",
                effects: (state) => {
                    addLog("You stall, trying to control the rooftop situation.");
                }
            }
        ]
    },

    rival_team_scene: {
        title: "23: Negotiation or Firefight",
        text: `You approach the rival team.
They’re armed, but not immediately hostile.

Their leader speaks: "We’re here for the same drive. 
You walk away, we take the risk. No one has to get hurt."`,
        choices: [
            {
                text: "Refuse and prepare for a fight.",
                next: "ending_bloody",
                effects: (state) => {
                    addLog("You choose defiance. The rooftop becomes a battleground.");
                }
            },
            {
                text: "Offer a deal: split the data, share the risk.",
                next: "ending_compromise",
                effects: (state) => {
                    addLog("You try to broker a compromise in the chaos.");
                }
            }
        ]
    },

    solo_escape_attempt: {
        title: "24: Lone Exit",
        text: `You slip away from Vega, taking a maintenance route toward the roof.

Without backup, every shadow feels heavier.
Your wristband pings: "Rival team proximity: high."

You’re fast, but alone.`,
        choices: [
            {
                text: "Push hard to reach the rooftop before they do.",
                next: "rooftop_approach",
                effects: (state) => {
                    state.flags.timePressure = true;
                    addLog("You race the clock and the rival team.");
                }
            }
        ]
    },

    ending_clean: {
        title: "Ending: Clean Extraction",
        text: `You confirm the drive is secure.
The helicopter swings in, lowering a harness.

You clip in as the rival team scrambles below.
Gunfire cracks, but you’re already rising above the chaos.

Mission status: SUCCESS.
Data integrity: HIGH.
Exposure: MODERATE.

You disappear into the night, another ghost in the city’s neon haze.`,
        choices: [
            {
                text: "Play again from the beginning.",
                next: "intro",
                effects: (state) => {
                    resetMysteryState();
                    addLog("You restart the mystery, looking for different paths.");
                }
            }
        ]
    },

    ending_bloody: {
        title: "Ending: Rooftop Clash",
        text: `You refuse to stand down.

The rooftop erupts into motion — gunfire, shouting, the thump of rotor blades.
You take cover behind a vent, returning fire when you can.

By the time the helicopter pulls away, the rival team is scattered.
You’re alive, but barely.

Mission status: PARTIAL.
Data integrity: UNKNOWN.
Exposure: HIGH.

You limp toward the stairwell, knowing this night will echo for a long time.`,
        choices: [
            {
                text: "Play again from the beginning.",
                next: "intro",
                effects: (state) => {
                    resetMysteryState();
                    addLog("You restart, wondering how it could have gone cleaner.");
                }
            }
        ]
    },

    ending_compromise: {
        title: "Ending: Shared Risk",
        text: `You propose a deal.

After a tense silence, the rival leader nods.
"You’re either very smart or very desperate," they say.

You copy the drive to a secure shard, handing them a partial key.
In return, they stand down and let you walk.

Mission status: COMPLEX.
Data integrity: SPLIT.
Exposure: LOW.

You leave the rooftop with more allies than enemies — for now.`,
        choices: [
            {
                text: "Play again from the beginning.",
                next: "intro",
                effects: (state) => {
                    resetMysteryState();
                    addLog("You restart, curious about the other endings.");
                }
            }
        ]
    }
};

function addLog(message) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    const time = ((Date.now() - mysteryState.startedAt) / 1000).toFixed(1);
    entry.textContent = `[${time}s] ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

function resetMysteryState() {
    mysteryState = {
        currentSceneId: "intro",
        startedAt: Date.now(),
        flags: {
            hasKeycard: false,
            trustedAgent: false,
            accessedServer: false,
            rooftopReady: false,
            wounded: false,
            timePressure: false
        },
        history: []
    };
}

function renderScene() {
    const scene = scenes[mysteryState.currentSceneId];
    if (!scene) return;

    mysteryState.history.push(mysteryState.currentSceneId);

    sceneTitleEl.textContent = scene.title;
    sceneTextEl.textContent = scene.text;

    choicesEl.innerHTML = "";

    scene.choices.forEach((choice, index) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice.text;

        btn.addEventListener("click", () => {
            if (choice.effects) {
                choice.effects(mysteryState);
            }
            mysteryState.currentSceneId = choice.next;
            renderScene();
        });

        choicesEl.appendChild(btn);
    });

    updateStatus();
}

function updateStatus() {
    const elapsed = Date.now() - mysteryState.startedAt;
    const remaining = Math.max(TOTAL_TIME_MS - elapsed, 0);
    const remainingMin = Math.floor(remaining / 60000);
    const remainingSec = Math.floor((remaining % 60000) / 1000);

    timerEl.textContent = `Time left: ${remainingMin}m ${remainingSec}s`;

    let statusText = "Status: ";
    if (mysteryState.flags.wounded) statusText += "Wounded · ";
    if (mysteryState.flags.timePressure) statusText += "Under time pressure · ";
    if (mysteryState.flags.accessedServer) statusText += "Server accessed · ";
    if (mysteryState.flags.rooftopReady) statusText += "Rooftop engaged · ";
    if (mysteryState.flags.trustedAgent) statusText += "Working with Vega · ";
    if (!mysteryState.flags.wounded &&
        !mysteryState.flags.timePressure &&
        !mysteryState.flags.accessedServer &&
        !mysteryState.flags.rooftopReady &&
        !mysteryState.flags.trustedAgent) {
        statusText += "In motion";
    }

    statusEl.textContent = statusText;
}

setInterval(updateStatus, 1000);

renderScene();
