/* =========================================================
   ⚡ NEXUS // KHATARNAK JAVASCRIPT ENGINE
   ========================================================= */

"use strict";

/* =========================
   CONFIG
========================= */

const CONFIG = {
    appName: "NEXUS",
    version: "1.0.0",
    particleCount: 90,
    maxLogs: 100,
    storageKey: "nexus_settings"
};

/* =========================
   STATE
========================= */

const state = {
    theme: "dark",
    particles: true,
    matrix: false,
    sound: false,
    commandHistory: [],
    historyIndex: -1,
    clicks: 0,
    uptime: Date.now(),
    cpu: 0,
    memory: 0,
    network: 0,
    notifications: 0,
    booted: false
};

/* =========================
   UTILITIES
========================= */

const $ = selector => document.querySelector(selector);

const create = (tag, props = {}, parent = document.body) => {
    const el = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
        if (key === "text") el.textContent = value;
        else if (key === "html") el.innerHTML = value;
        else if (key === "class") el.className = value;
        else if (key === "style") Object.assign(el.style, value);
        else el.setAttribute(key, value);
    });

    parent.appendChild(el);
    return el;
};

const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

/* =========================
   STORAGE
========================= */

function saveSettings() {
    localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify({
            theme: state.theme,
            particles: state.particles,
            matrix: state.matrix,
            sound: state.sound
        })
    );
}

function loadSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(CONFIG.storageKey)
        );

        if (!saved) return;

        state.theme = saved.theme ?? "dark";
        state.particles = saved.particles ?? true;
        state.matrix = saved.matrix ?? false;
        state.sound = saved.sound ?? false;
    } catch {
        console.warn("Settings could not be loaded.");
    }
}

/* =========================
   GLOBAL STYLE
========================= */

const style = create("style");

style.textContent = `
* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    width: 100%;
    min-height: 100%;
    background: #05070c;
    color: #eaf2ff;
    font-family: Arial, Helvetica, sans-serif;
    overflow-x: hidden;
}

body {
    min-height: 100vh;
}

button,
input {
    font: inherit;
}

button {
    cursor: pointer;
}

::selection {
    background: #00e5ff;
    color: #000;
}

#nexus-bg {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
        radial-gradient(circle at 20% 20%, #063b4b 0%, transparent 28%),
        radial-gradient(circle at 80% 80%, #26104f 0%, transparent 30%),
        #05070c;
}

#grid {
    position: fixed;
    inset: 0;
    z-index: -4;
    opacity: .2;
    background-image:
        linear-gradient(#00e5ff15 1px, transparent 1px),
        linear-gradient(90deg, #00e5ff15 1px, transparent 1px);
    background-size: 45px 45px;
}

#particles {
    position: fixed;
    inset: 0;
    z-index: -3;
    pointer-events: none;
}

.particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: #00e5ff;
    border-radius: 50%;
    box-shadow: 0 0 12px #00e5ff;
}

.nexus {
    width: min(1250px, 94%);
    margin: auto;
    padding: 30px 0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    border: 1px solid #ffffff15;
    border-radius: 18px;
    background: #ffffff08;
    backdrop-filter: blur(18px);
    box-shadow: 0 20px 70px #0008;
}

.logo {
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 5px;
    color: #00e5ff;
    text-shadow: 0 0 20px #00e5ff88;
}

.status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #9caec4;
    font-size: 13px;
}

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 15px #00ff88;
}

.hero {
    margin-top: 35px;
    padding: 55px 35px;
    border-radius: 25px;
    border: 1px solid #ffffff12;
    background: linear-gradient(135deg, #ffffff09, #ffffff03);
    backdrop-filter: blur(20px);
}

.hero h1 {
    margin: 0;
    font-size: clamp(42px, 8vw, 90px);
    line-height: .95;
    letter-spacing: -4px;
}

.hero h1 span {
    color: #00e5ff;
    text-shadow: 0 0 35px #00e5ff66;
}

.hero p {
    color: #93a6bd;
    font-size: 17px;
    max-width: 650px;
    line-height: 1.7;
}

.clock {
    margin-top: 25px;
    font-size: 42px;
    font-weight: 800;
    letter-spacing: 3px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-top: 20px;
}

.card {
    padding: 22px;
    border-radius: 18px;
    border: 1px solid #ffffff12;
    background: #ffffff08;
    backdrop-filter: blur(14px);
    transition: .25s;
}

.card:hover {
    transform: translateY(-5px);
    border-color: #00e5ff55;
    box-shadow: 0 15px 45px #00e5ff0d;
}

.card-title {
    color: #8192a8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.card-value {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 800;
}

.progress {
    height: 6px;
    margin-top: 15px;
    border-radius: 20px;
    background: #ffffff10;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #00e5ff, #7b5cff);
    box-shadow: 0 0 15px #00e5ff;
    transition: width .5s;
}

.section {
    margin-top: 20px;
}

.section-title {
    margin-bottom: 12px;
    color: #8fa3ba;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
}

.terminal {
    height: 330px;
    padding: 18px;
    overflow: auto;
    border: 1px solid #00e5ff20;
    border-radius: 18px;
    background: #020406cc;
    font-family: Consolas, monospace;
    font-size: 13px;
    box-shadow: inset 0 0 40px #00e5ff05;
}

.log {
    margin: 4px 0;
    color: #8fa3ba;
}

.log.success {
    color: #00ff9d;
}

.log.warning {
    color: #ffd166;
}

.log.error {
    color: #ff5577;
}

.log.command {
    color: #00e5ff;
}

.command-line {
    display: flex;
    margin-top: 10px;
    border: 1px solid #ffffff15;
    border-radius: 12px;
    overflow: hidden;
    background: #0008;
}

.command-line span {
    padding: 13px;
    color: #00ff9d;
    font-family: monospace;
}

#commandInput {
    flex: 1;
    border: 0;
    outline: 0;
    padding: 13px;
    color: white;
    background: transparent;
    font-family: monospace;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.action {
    border: 1px solid #ffffff15;
    border-radius: 10px;
    padding: 11px 16px;
    color: #dce9f8;
    background: #ffffff08;
    transition: .2s;
}

.action:hover {
    background: #00e5ff15;
    border-color: #00e5ff55;
}

.footer {
    padding: 35px 0;
    text-align: center;
    color: #53667d;
    font-size: 12px;
}

.notification {
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 100;
    width: 300px;
    padding: 16px;
    border: 1px solid #00e5ff33;
    border-radius: 14px;
    background: #071019ee;
    backdrop-filter: blur(20px);
    box-shadow: 0 15px 50px #0008;
    animation: notifyIn .35s ease;
}

@keyframes notifyIn {
    from {
        opacity: 0;
        transform: translateX(50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.flash {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: white;
    pointer-events: none;
    animation: flash .15s forwards;
}

@keyframes flash {
    from { opacity: .8; }
    to { opacity: 0; }
}

.matrix-mode {
    filter: hue-rotate(90deg) contrast(1.2);
}

@media (max-width: 800px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .header {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (max-width: 500px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .hero {
        padding: 35px 20px;
    }

    .clock {
        font-size: 28px;
    }
}
`;

/* =========================
   APP STRUCTURE
========================= */

loadSettings();

const bg = create("div", { id: "nexus-bg" });
const grid = create("div", { id: "grid" });
const particlesLayer = create("div", { id: "particles" });

const app = create("main", { class: "nexus" });

/* HEADER */

const header = create("header", { class: "header" }, app);

create("div", {
    class: "logo",
    text: CONFIG.appName
}, header);

const status = create("div", { class: "status" }, header);

create("span", {
    class: "status-dot"
}, status);

create("span", {
    id: "statusText",
    text: "SYSTEM ONLINE"
}, status);

/* HERO */

const hero = create("section", { class: "hero" }, app);

create("h1", {
    html: `WELCOME TO <span>NEXUS</span>`
}, hero);

create("p", {
    text:
        "A completely client-side JavaScript control system. " +
        "No frameworks. No libraries. Just pure JavaScript doing ridiculous things."
}, hero);

create("div", {
    class: "clock",
    id: "clock",
    text: "00:00:00"
}, hero);

/* STATS */

const stats = create("section", { class: "grid" }, app);

function makeStat(title, id) {
    const card = create("div", { class: "card" }, stats);

    create("div", {
        class: "card-title",
        text: title
    }, card);

    create("div", {
        class: "card-value",
        id,
        text: "0%"
    }, card);

    const progress = create("div", {
        class: "progress"
    }, card);

    create("div", {
        class: "progress-bar",
        id: id + "Bar"
    }, progress);
}

makeStat("CPU LOAD", "cpu");
makeStat("MEMORY", "memory");
makeStat("NETWORK", "network");
makeStat("ACTIVITY", "activity");

/* TERMINAL */

const terminalSection = create("section", {
    class: "section"
}, app);

create("div", {
    class: "section-title",
    text: "COMMAND TERMINAL"
}, terminalSection);

const terminal = create("div", {
    class: "terminal",
    id: "terminal"
}, terminalSection);

const commandLine = create("div", {
    class: "command-line"
}, terminalSection);

create("span", {
    text: "nexus@system:~$"
}, commandLine);

const input = create("input", {
    id: "commandInput",
    autocomplete: "off",
    spellcheck: "false",
    placeholder: "type 'help'..."
}, commandLine);

/* ACTIONS */

const actionSection = create("section", {
    class: "section"
}, app);

create("div", {
    class: "section-title",
    text: "QUICK ACTIONS"
}, actionSection);

const actions = create("div", {
    class: "actions"
}, actionSection);

const actionList = [
    ["Notify", () => notify("Hello from NEXUS ⚡")],
    ["Matrix", toggleMatrix],
    ["Particles", toggleParticles],
    ["Theme", randomTheme],
    ["Clear Terminal", clearTerminal],
    ["System Scan", systemScan],
    ["Emergency Flash", flashScreen],
    ["Randomize", randomizeEverything]
];

actionList.forEach(([name, fn]) => {
    const button = create("button", {
        class: "action",
        text: name
    }, actions);

    button.addEventListener("click", fn);
});

/* FOOTER */

create("footer", {
    class: "footer",
    text: `NEXUS ${CONFIG.version} • Pure JavaScript • No Framework`
}, app);

/* =========================
   TERMINAL
========================= */

function log(message, type = "") {
    const line = document.createElement("div");

    line.className = `log ${type}`;

    const time = new Date().toLocaleTimeString();

    line.textContent = `[${time}] ${message}`;

    terminal.appendChild(line);

    while (terminal.children.length > CONFIG.maxLogs) {
        terminal.removeChild(terminal.firstChild);
    }

    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    terminal.innerHTML = "";
    log("Terminal cleared.", "success");
}

function command(cmd) {
    const clean = cmd.trim().toLowerCase();

    if (!clean) return;

    state.commandHistory.push(cmd);
    state.historyIndex = state.commandHistory.length;

    log(`> ${cmd}`, "command");

    switch (clean) {
        case "help":
            log("Available commands:", "success");
            log("help       → show commands");
            log("clear      → clear terminal");
            log("status     → system status");
            log("matrix     → toggle matrix");
            log("particles  → toggle particles");
            log("theme      → random theme");
            log("scan       → run system scan");
            log("time       → show current time");
            log("date       → show current date");
            log("about      → system information");
            log("whoami     → identify operator");
            log("hack       → ???");
            break;

        case "clear":
            clearTerminal();
            break;

        case "status":
            showStatus();
            break;

        case "matrix":
            toggleMatrix();
            break;

        case "particles":
            toggleParticles();
            break;

        case "theme":
            randomTheme();
            break;

        case "scan":
            systemScan();
            break;

        case "time":
            log(new Date().toLocaleTimeString(), "success");
            break;

        case "date":
            log(new Date().toLocaleDateString(), "success");
            break;

        case "about":
            log("NEXUS JavaScript Engine", "success");
            log("Version: " + CONFIG.version);
            log("Architecture: Vanilla JS");
            log("Dependencies: NONE");
            break;

        case "whoami":
            log("Operator detected: YOU.", "success");
            break;

        case "hack":
            fakeHack();
            break;

        case "42":
            log("The answer has been detected. 👀", "success");
            break;

        case "sudo":
            log("Nice try 😭 This is a browser.", "warning");
            break;

        default:
            log(`Unknown command: ${cmd}`, "error");
            log("Type 'help' for available commands.");
    }

    input.value = "";
}

/* =========================
   COMMAND INPUT
========================= */

input.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        command(input.value);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();

        if (!state.commandHistory.length) return;

        state.historyIndex--;

        if (state.historyIndex < 0) {
            state.historyIndex = 0;
        }

        input.value =
            state.commandHistory[state.historyIndex];
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();

        state.historyIndex++;

        if (state.historyIndex >= state.commandHistory.length) {
            state.historyIndex = state.commandHistory.length;
            input.value = "";
            return;
        }

        input.value =
            state.commandHistory[state.historyIndex];
    }
});

/* =========================
   CLOCK
========================= */

function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString();

    $("#clock").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

/* =========================
   SYSTEM STATS
========================= */

function updateStats() {

    state.cpu = random(5, 98);
    state.memory = random(20, 92);
    state.network = random(5, 100);
    state.clicks = clamp(state.clicks, 0, 999999);

    $("#cpu").textContent = state.cpu + "%";
    $("#memory").textContent = state.memory + "%";
    $("#network").textContent = state.network + "%";

    $("#cpuBar").style.width = state.cpu + "%";
    $("#memoryBar").style.width = state.memory + "%";
    $("#networkBar").style.width = state.network + "%";

    const activity =
        Math.min(
            100,
            Math.round(
                (state.clicks % 100) +
                random(0, 20)
            )
        );

    $("#activity").textContent = activity + "%";
    $("#activityBar").style.width = activity + "%";
}

setInterval(updateStats, 1500);
updateStats();

/* =========================
   PARTICLE ENGINE
========================= */

const particles = [];

function createParticles() {

    particlesLayer.innerHTML = "";
    particles.length = 0;

    for (let i = 0; i < CONFIG.particleCount; i++) {

        const particle = create(
            "div",
            { class: "particle" },
            particlesLayer
        );

        const data = {
            el: particle,
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            vx: (Math.random() - .5) * .5,
            vy: (Math.random() - .5) * .5,
            size: random(1, 3)
        };

        particle.style.width = data.size + "px";
        particle.style.height = data.size + "px";

        particles.push(data);
    }
}

function animateParticles() {

    if (!state.particles) {
        requestAnimationFrame(animateParticles);
        return;
    }

    particles.forEach(p => {

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > innerWidth)
            p.vx *= -1;

        if (p.y < 0 || p.y > innerHeight)
            p.vy *= -1;

        p.el.style.left = p.x + "px";
        p.el.style.top = p.y + "px";
    });

    requestAnimationFrame(animateParticles);
}

createParticles();
animateParticles();

window.addEventListener("resize", createParticles);

/* =========================
   PARTICLE TOGGLE
========================= */

function toggleParticles() {

    state.particles = !state.particles;

    particlesLayer.style.display =
        state.particles ? "block" : "none";

    saveSettings();

    log(
        `Particles ${state.particles ? "enabled" : "disabled"}.`,
        "success"
    );
}

/* =========================
   MATRIX
========================= */

function toggleMatrix() {

    state.matrix = !state.matrix;

    document.body.classList.toggle(
        "matrix-mode",
        state.matrix
    );

    saveSettings();

    log(
        `Matrix mode ${state.matrix ? "activated" : "deactivated"}.`,
        "success"
    );
}

/* =========================
   THEMES
========================= */

const themes = [
    ["#00e5ff", "#7b5cff"],
    ["#00ff88", "#00e5ff"],
    ["#ff4ecd", "#7b5cff"],
    ["#ffd166", "#ff5577"],
    ["#7df9ff", "#ffffff"]
];

function randomTheme() {

    const [primary, secondary] =
        themes[random(0, themes.length - 1)];

    document.documentElement.style.setProperty(
        "--primary",
        primary
    );

    style.textContent += `
        .logo,
        .hero h1 span {
            color: ${primary} !important;
        }

        .progress-bar {
            background:
                linear-gradient(
                    90deg,
                    ${primary},
                    ${secondary}
                ) !important;
        }
    `;

    state.theme = primary;

    saveSettings();

    notify("Theme changed ⚡");
    log(`Theme switched to ${primary}.`, "success");
}

/* =========================
   NOTIFICATIONS
========================= */

function notify(message) {

    state.notifications++;

    const box = create("div", {
        class: "notification"
    });

    box.innerHTML = `
        <strong>NEXUS</strong>
        <div style="
            margin-top:7px;
            color:#9fb1c7;
            line-height:1.5;
        ">
            ${message}
        </div>
    `;

    setTimeout(() => {
        box.style.opacity = "0";
        box.style.transform = "translateX(30px)";

        setTimeout(() => box.remove(), 300);
    }, 2800);
}

/* =========================
   FAKE SYSTEM SCAN
========================= */

async function systemScan() {

    log("Initializing system scan...", "warning");

    const checks = [
        "Checking browser engine",
        "Checking local storage",
        "Checking DOM integrity",
        "Checking JavaScript runtime",
        "Checking animation engine",
        "Checking event listeners",
        "Checking UI modules",
        "Checking particle engine"
    ];

    for (const check of checks) {

        await sleep(random(150, 450));

        log(
            `${check} ........ OK`,
            "success"
        );
    }

    log("SYSTEM SCAN COMPLETE.", "success");

    notify("System scan completed successfully.");
}

/* =========================
   FAKE HACK MODE
========================= */

async function fakeHack() {

    log("Initializing simulation...", "warning");

    const sequence = [
        "Loading encrypted modules...",
        "Generating secure key...",
        "Analyzing DOM...",
        "Bypassing imaginary firewall...",
        "Decrypting absolutely nothing...",
        "Access level: LEGENDARY",
        "Simulation complete."
    ];

    for (const message of sequence) {

        await sleep(random(200, 500));

        log(message, "success");
    }

    flashScreen();

    notify("😈 HACK MODE SIMULATION COMPLETE");
}

/* =========================
   FLASH
========================= */

function flashScreen() {

    const flash = create("div", {
        class: "flash"
    });

    setTimeout(() => flash.remove(), 200);
}

/* =========================
   STATUS
========================= */

function showStatus() {

    const uptime =
        Math.floor(
            (Date.now() - state.uptime) / 1000
        );

    log("----- SYSTEM STATUS -----", "success");
    log(`Engine: ${CONFIG.appName}`);
    log(`Version: ${CONFIG.version}`);
    log(`Particles: ${state.particles ? "ON" : "OFF"}`);
    log(`Matrix: ${state.matrix ? "ON" : "OFF"}`);
    log(`Uptime: ${uptime}s`);
    log(`Notifications: ${state.notifications}`);
    log(`Clicks: ${state.clicks}`);
    log("-------------------------");
}

/* =========================
   RANDOMIZER
========================= */

function randomizeEverything() {

    state.clicks += random(1, 50);

    randomTheme();

    if (Math.random() > .5)
        toggleMatrix();

    if (Math.random() > .5)
        toggleParticles();

    flashScreen();

    notify("Everything randomized ⚡");

    log(
        "System parameters randomized.",
        "warning"
    );
}

/* =========================
   MOUSE ENGINE
========================= */

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;

window.addEventListener("mousemove", event => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    const x = mouseX / innerWidth;
    const y = mouseY / innerHeight;

    bg.style.background = `
        radial-gradient(
            circle at ${x * 100}% ${y * 100}%,
            #063b4b 0%,
            transparent 28%
        ),
        radial-gradient(
            circle at ${100 - x * 100}% ${100 - y * 100}%,
            #26104f 0%,
            transparent 30%
        ),
        #05070c
    `;
});

/* =========================
   CLICK ENGINE
========================= */

document.addEventListener("click", event => {

    state.clicks++;

    if (
        event.target.tagName === "BUTTON"
    ) {
        event.target.style.transform = "scale(.95)";

        setTimeout(() => {
            event.target.style.transform = "";
        }, 100);
    }
});

/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener("keydown", event => {

    if (event.ctrlKey && event.key === "k") {

        event.preventDefault();

        input.focus();

        notify("Terminal focused.");
    }

    if (event.key === "Escape") {

        input.blur();

        notify("Escape sequence detected.");
    }

    if (event.ctrlKey && event.shiftKey && event.key === "M") {

        event.preventDefault();

        toggleMatrix();
    }

    if (event.ctrlKey && event.shiftKey && event.key === "P") {

        event.preventDefault();

        toggleParticles();
    }
});

/* =========================
   KONAMI-STYLE SECRET
========================= */

const secretCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight"
];

let secretIndex = 0;

document.addEventListener("keydown", event => {

    if (event.key === secretCode[secretIndex]) {

        secretIndex++;

        if (secretIndex === secretCode.length) {

            secretIndex = 0;

            secretMode();
        }

    } else {

        secretIndex = 0;
    }
});

/* =========================
   SECRET MODE
========================= */

async function secretMode() {

    log("SECRET SEQUENCE ACCEPTED.", "success");

    notify("🚨 SECRET MODE ACTIVATED");

    for (let i = 0; i < 8; i++) {

        flashScreen();

        await sleep(120);
    }

    document.body.style.animation =
        "none";

    document.body.style.filter =
        "hue-rotate(180deg) saturate(1.8)";

    setTimeout(() => {

        document.body.style.filter = "";

        log(
            "Secret mode terminated.",
            "warning"
        );

    }, 3000);
}

/* =========================
   PERFORMANCE MONITOR
========================= */

let frames = 0;
let lastFrameTime = performance.now();
let fps = 60;

function performanceLoop(time) {

    frames++;

    if (time - lastFrameTime >= 1000) {

        fps = frames;

        frames = 0;

        lastFrameTime = time;

        if (fps < 30) {

            log(
                `Performance warning: ${fps} FPS`,
                "warning"
            );
        }
    }

    requestAnimationFrame(performanceLoop);
}

requestAnimationFrame(performanceLoop);

/* =========================
   RANDOM EVENTS
========================= */

setInterval(() => {

    const events = [
        "Background particle synchronized.",
        "Network pulse detected.",
        "DOM observer heartbeat.",
        "Visual engine synchronized.",
        "System entropy updated.",
        "New activity detected."
    ];

    if (Math.random() > .65) {

        log(
            events[random(0, events.length - 1)]
        );
    }

}, 5000);

/* =========================
   BOOT SEQUENCE
========================= */

async function boot() {

    const messages = [
        "Booting NEXUS...",
        "Loading interface...",
        "Initializing JavaScript engine...",
        "Starting particle system...",
        "Connecting UI modules...",
        "Loading command processor...",
        "Checking system integrity...",
        "All systems operational."
    ];

    for (const message of messages) {

        await sleep(180);

        log(
            message,
            message.includes("operational")
                ? "success"
                : ""
        );
    }

    state.booted = true;

    notify("NEXUS is ready. ⚡");

    input.focus();
}

boot();

/* =========================
   FINAL GLOBAL OBJECT
========================= */

window.NEXUS = {

    version: CONFIG.version,

    state,

    notify,

    scan: systemScan,

    hack: fakeHack,

    matrix: toggleMatrix,

    particles: toggleParticles,

    theme: randomTheme,

    clear: clearTerminal,

    status: showStatus,

    flash: flashScreen,

    randomize: randomizeEverything,

    command,

    reboot() {
        location.reload();
    }
};

console.log(
    "%c NEXUS ONLINE ",
    "background:#00e5ff;color:#000;padding:10px;font-weight:bold;"
);

console.log(
    "%cTry: NEXUS.hack()",
    "color:#00ff88;font-size:14px;"
);

console.log(
    "%cKeyboard: CTRL+K = Terminal | CTRL+SHIFT+M = Matrix",
    "color:#9caec4;"
);