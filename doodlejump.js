


let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
};

let velocityX = 0;
let velocityY = 0;
let jumpVelocity = -9;
let bounceGravity = 0.3;
let fallGravity = 0.8;

let platformArray = [];
let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
let gameOver = false;
let playerName = "Player";

// Cache key states for smoother movement
let keys = {};

window.onload = function () {
    playerName = prompt("Enter your name (Max 8 characters):")?.substring(0, 8) || "Player";

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    doodler.img = new Image();
    doodler.img.src = "./doodler-right.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    doodler.img.onload = function () {
        platformImg.onload = function () {
            placePlatforms();
            generateStars();
            requestAnimationFrame(update);
        };
    };

    document.addEventListener("keydown", (e) => (keys[e.code] = true));
    document.addEventListener("keyup", (e) => (keys[e.code] = false));
};

function update() {
    if (gameOver) return;
    context.clearRect(0, 0, board.width, board.height);

    updateDoodler();
    updatePlatforms();
    drawStars();
    drawPlatforms();
    drawDoodler();

    updateScore();
    displayScore();

    if (gameOver) displayGameOver();
    else requestAnimationFrame(update);
}

function updateDoodler() {
    if (keys["ArrowRight"] || keys["KeyD"]) {
        velocityX = 4;
    } else if (keys["ArrowLeft"] || keys["KeyA"]) {
        velocityX = -4;
    } else {
        velocityX = 0;
    }

    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    velocityY += velocityY < 0 ? bounceGravity : fallGravity;
    doodler.y += velocityY;

    if (doodler.y > boardHeight) gameOver = true;

    if (doodler.y < boardHeight / 2) {
        let offset = boardHeight / 2 - doodler.y;
        doodler.y = boardHeight / 2;
        platformArray.forEach((platform) => (platform.y += offset));
        stars.forEach((star) => (star.y = (star.y + offset) % boardHeight));
        score += offset * 0.1;
    }
}

function placePlatforms() {
    platformArray = [];
    for (let i = 0; i < 15; i++) {
        let x = Math.random() * (boardWidth - 80);
        let y = boardHeight - i * 60;
        platformArray.push({ x, y, width: 80, height: 18 });
    }
}

function updatePlatforms() {
    platformArray = platformArray.filter((platform) => platform.y < boardHeight);
    while (platformArray.length < 15) {
        let x = Math.random() * (boardWidth - 80);
        let y = platformArray[platformArray.length - 1].y - 60;
        platformArray.push({ x, y, width: 80, height: 18 });
    }
}

function drawPlatforms() {
    platformArray.forEach((platform) =>
        context.drawImage(platformImg, platform.x, platform.y, platform.width, platform.height)
    );
}

function drawDoodler() {
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
}

function generateStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push({ x: Math.random() * boardWidth, y: Math.random() * boardHeight });
    }
}

function drawStars() {
    context.fillStyle = "white";
    stars.forEach((star) => {
        context.beginPath();
        context.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
        context.fill();
    });
}

function updateScore() {
    score = Math.max(score, doodler.y);
}

function displayScore() {
    context.fillStyle = "white";
    context.font = "16px Arial";
    context.fillText(`Score: ${Math.floor(score)}`, 10, 20);
}

function displayGameOver() {
    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "24px Arial";
    context.fillText(`Game Over!`, boardWidth / 2, boardHeight / 2 - 20);
    context.fillText(`Score: ${Math.floor(score)}`, boardWidth / 2, boardHeight / 2 + 20);
    context.fillText(`Press Space to Restart`, boardWidth / 2, boardHeight / 2 + 60);
}
