const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const finalBest = document.getElementById("finalBest");

const startScreen = document.getElementById("startScreen");
const gameOver = document.getElementById("gameOver");
const secretMessage = document.getElementById("secretMessage");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const leftZone = document.getElementById("leftZone");
const rightZone = document.getElementById("rightZone");

let width;
let height;
let dpr;

let player;
let platforms;
let particles;

let score = 0;
let bestScore = Number(localStorage.getItem("cakeJumpBest")) || 0;
let cameraY = 0;
let gameRunning = false;
let unlocked = false;

let moveLeft = false;
let moveRight = false;

const GOAL_SCORE = 5242;

bestText.textContent = bestScore;

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resetGame() {
    score = 0;
    cameraY = 0;
    unlocked = false;
    particles = [];

    player = {
    x: width / 2,
    y: height - 160,
    radius: 18,
    vx: 0,
    vy: -15
    };

    platforms = [];

    platforms.push({
    x: width / 2 - 60,
    y: height - 90,
    w: 120,
    h: 16,
    type: "base",
    moving: false,
    speed: 0
    });

    let y = height - 170;

    for (let i = 0; i < 28; i++) {
    createPlatform(y);
    y -= 90;
    }

    scoreText.textContent = 0;
    gameOver.style.display = "none";
    secretMessage.style.display = "none";
}

function createPlatform(y) {
    const difficulty = Math.min(score / GOAL_SCORE, 1);

    const platformWidth = Math.max(68, 112 - difficulty * 28);

    const isMoving = score > 1800 && Math.random() > 0.82;

    platforms.push({
    x: Math.random() * (width - platformWidth - 24) + 12,
    y: y,
    w: platformWidth,
    h: 14,
    type: Math.random() > 0.8 ? "heart" : "cloud",
    moving: isMoving,
    speed: isMoving
        ? (Math.random() > 0.5 ? 1 : -1) * (0.45 + difficulty * 0.7)
        : 0
    });
}

function startGame() {
    resizeCanvas();
    resetGame();
    startScreen.style.display = "none";
    gameOver.style.display = "none";
    secretMessage.style.display = "none";
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    finalBest.textContent = bestScore;
    gameOver.style.display = "flex";
}

function unlockSecret() {
    gameRunning = false;
    unlocked = true;
    secretMessage.style.display = "flex";
    createConfetti();
}

function update() {
    const difficulty = Math.min(score / GOAL_SCORE, 1);

    if (moveLeft) player.vx -= 0.58;
    if (moveRight) player.vx += 0.58;

    player.vx *= 0.88;
    player.vy += 0.4 + difficulty * 0.04;

    player.x += player.vx;
    player.y += player.vy;

    if (player.x < -player.radius) {
    player.x = width + player.radius;
    }

    if (player.x > width + player.radius) {
    player.x = -player.radius;
    }

    platforms.forEach(platform => {
    if (platform.moving) {
        platform.x += platform.speed;

        if (platform.x <= 8 || platform.x + platform.w >= width - 8) {
        platform.speed *= -1;
        }
    }
    });

    if (player.vy > 0) {
    platforms.forEach(platform => {
        const playerBottom = player.y + player.radius;
        const wasAbove = player.y + player.radius - player.vy <= platform.y;

        if (
        wasAbove &&
        playerBottom >= platform.y &&
        playerBottom <= platform.y + platform.h + 14 &&
        player.x > platform.x &&
        player.x < platform.x + platform.w
        ) {
        player.vy = -13.2;
        addBounceParticles(player.x, platform.y);
        }
    });
    }

    if (player.y < height * 0.42) {
    const difference = height * 0.42 - player.y;

    player.y = height * 0.42;
    cameraY += difference;

    platforms.forEach(platform => {
        platform.y += difference;
    });

    score += Math.floor(difference * 0.42);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("cakeJumpBest", bestScore);
    }

    scoreText.textContent = score;
    bestText.textContent = bestScore;

    if (score >= GOAL_SCORE && !unlocked) {
        unlockSecret();
    }
    }

    platforms = platforms.filter(platform => platform.y < height + 80);

    while (platforms.length < 28) {
    const highestY = Math.min(...platforms.map(p => p.y));
    const gap = 88 + difficulty * 18;
    createPlatform(highestY - gap);
    }

    particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    });

    particles = particles.filter(p => p.life > 0);

    if (player.y - player.radius > height + 40) {
    endGame();
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#AD1919";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 22; i++) {
    const x = (i * 73 + cameraY * 0.12) % width;
    const y = (i * 127 + cameraY * 0.22) % height;

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#ffffff";
    ctx.font = `${18 + (i % 3) * 8}px serif`;
    ctx.fillText("♡", x, y);
    }

    ctx.globalAlpha = 1;
}

function drawPlatform(platform) {
    ctx.save();

    ctx.fillStyle = platform.type === "heart" ? "#ffd7df" : "#fff8f8";

    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    roundRect(platform.x, platform.y, platform.w, platform.h, 8);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "#AD1919";
    ctx.font = "16px serif";
    ctx.fillText("♡", platform.x + platform.w / 2 - 5, platform.y + 12);
}

function drawPlayer() {
    ctx.save();

    ctx.translate(player.x, player.y);

    ctx.fillStyle = "#fff8f8";
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;

    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#AD1919";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♡", 0, 1);

    ctx.restore();
}

function drawParticles() {
    particles.forEach(p => {
    ctx.globalAlpha = p.life / 25;
    ctx.fillStyle = "#fff8f8";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    });
}

function addBounceParticles(x, y) {
    for (let i = 0; i < 8; i++) {
    particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 1.5) * 3,
        size: Math.random() * 3 + 2,
        life: 25
    });
    }
}

function draw() {
    drawBackground();
    platforms.forEach(drawPlatform);
    drawParticles();
    drawPlayer();
}

function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function createConfetti() {
    for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 1.5 + "s";
    confetti.style.background = ["#fff", "#ffd7df", "#ffb3c1", "#ffe6ea"][Math.floor(Math.random() * 4)];

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 4500);
    }
}

function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function pressLeft(e) {
    e.preventDefault();
    moveLeft = true;
}

function pressRight(e) {
    e.preventDefault();
    moveRight = true;
}

function releaseLeft(e) {
    e.preventDefault();
    moveLeft = false;
}

function releaseRight(e) {
    e.preventDefault();
    moveRight = false;
}

leftZone.addEventListener("touchstart", pressLeft);
leftZone.addEventListener("touchend", releaseLeft);
leftZone.addEventListener("touchcancel", releaseLeft);

rightZone.addEventListener("touchstart", pressRight);
rightZone.addEventListener("touchend", releaseRight);
rightZone.addEventListener("touchcancel", releaseRight);

leftZone.addEventListener("mousedown", pressLeft);
rightZone.addEventListener("mousedown", pressRight);

leftZone.addEventListener("mouseup", releaseLeft);
rightZone.addEventListener("mouseup", releaseRight);

leftZone.addEventListener("mouseleave", releaseLeft);
rightZone.addEventListener("mouseleave", releaseRight);

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    moveLeft = true;
    }

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    moveRight = true;
    }
});

window.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    moveLeft = false;
    }

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    moveRight = false;
    }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

window.addEventListener("resize", () => {
    resizeCanvas();

    if (!gameRunning) {
    draw();
    }
});

resizeCanvas();
resetGame();
draw();
