

let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;

let doodlerRightImg, doodlerLeftImg, platformImg, breakablePlatformImg;
let doodler = { img: null, x: doodlerX, y: doodlerY, width: doodlerWidth, height: doodlerHeight };

let velocityX = 0;
let velocityY = 0;
let jumpVelocity = -9;
let bounceGravity = 0.3;
let fallGravity = 0.8;

let platformArray = [];
let platformWidth = 80;
let platformHeight = 18;

let stars = [];
let numStars = 50; // Reduced to optimize rendering

let score = 0;
let highScore = 0;
let gameOver = false;
let playerName = "Player";
let lastYPosition = doodlerY;

window.onload = function () {
    playerName = prompt("Enter your name (Max 8 characters):") || "Player";
    playerName = playerName.substring(0, 8);

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    doodlerRightImg = loadImage("./doodler-right.png");
    doodlerLeftImg = loadImage("./doodler-left.png");
    platformImg = loadImage("./platform.png");
    breakablePlatformImg = loadImage("./platform-broken.png");

    doodler.img = doodlerRightImg;
    velocityY = jumpVelocity;

    Promise.all([doodlerRightImg, platformImg]).then(() => {
        placePlatforms();
        generateStars();
        requestAnimationFrame(update);
    });

    document.addEventListener("keydown", moveDoodler);
};

// Utility to load images
function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

function update() {
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    drawStars();
    moveDoodlerHorizontally();
    applyGravity();
    adjustCamera();

    if (doodler.y > boardHeight) gameOver = true;

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    updatePlatforms();
    removeOffScreenPlatforms();
    generateNewPlatforms();
    updateScore();
    displayText();

    if (gameOver) displayGameOver();
    else requestAnimationFrame(update);
}

function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code === "Space" && gameOver) {
        resetGame();
        requestAnimationFrame(update);
    }
}

function moveDoodlerHorizontally() {
    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth;
}

function applyGravity() {
    velocityY += velocityY < 0 ? bounceGravity : fallGravity;
    doodler.y += velocityY;
}

function adjustCamera() {
    const threshold = boardHeight / 2;
    if (doodler.y < threshold) {
        const offset = threshold - doodler.y;
        doodler.y = threshold;

        platformArray.forEach((platform) => (platform.y += offset));
        stars.forEach((star) => (star.y = (star.y + offset) % boardHeight));

        score += offset * 0.1;
    }
}

function updatePlatforms() {
    for (let platform of platformArray) {
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = jumpVelocity;
            if (platform.isBreakable) platformArray.splice(platformArray.indexOf(platform), 1);
        }
        if (platform.y >= 0) {
            context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
        }
    }
}

function removeOffScreenPlatforms() {
    platformArray = platformArray.filter((platform) => platform.y < boardHeight);
}

function generateNewPlatforms() {
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }
}

function placePlatforms() {
    platformArray = [];
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (boardWidth - platformWidth);
        const y = boardHeight - (i + 1) * 60;
        platformArray.push({
            img: Math.random() < 0.2 ? breakablePlatformImg : platformImg,
            x,
            y,
            width: platformWidth,
            height: platformHeight,
            isBreakable: Math.random() < 0.2,
        });
    }
}

function newPlatform() {
    const x = Math.random() * (boardWidth - platformWidth);
    const y = -platformHeight - Math.random() * 50;
    const isBreakable = Math.random() < 0.2;
    platformArray.push({
        img: isBreakable ? breakablePlatformImg : platformImg,
        x,
        y,
        width: platformWidth,
        height: platformHeight,
        isBreakable,
    });
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function generateStars() {
    stars = Array.from({ length: numStars }, () => ({
        x: Math.random() * boardWidth,
        y: Math.random() * boardHeight,
    }));
}

function drawStars() {
    stars.forEach((star) => {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
        context.fill();
    });
}

function updateScore() {
    if (doodler.y < lastYPosition) {
        score += 0.5;
        lastYPosition = doodler.y;
    }
    highScore = Math.max(highScore, score);
}

function displayText() {
    context.fillStyle = "white";
    context.font = "16px 'Gloria Hallelujah', cursive";
    context.fillText(`${playerName} ${Math.floor(score)}`, 5, 20);
}

function displayGameOver() {
    context.fillStyle = "white";
    context.font = "20px 'Gloria Hallelujah', cursive";
    context.fillText(`Game Over! Press Space to Restart`, boardWidth / 2 - 100, boardHeight / 2);
    context.fillText(`Final Score: ${Math.floor(score)}`, boardWidth / 2 - 70, boardHeight / 2 + 30);
    context.fillText(`High Score: ${Math.floor(highScore)}`, boardWidth / 2 - 70, boardHeight / 2 + 60);
}

function resetGame() {
    doodler = { img: doodlerRightImg, x: doodlerX, y: doodlerY, width: doodlerWidth, height: doodlerHeight };
    velocityX = 0;
    velocityY = jumpVelocity;
    score = 0;
    gameOver = false;
    lastYPosition = doodlerY;
    platformArray = [];
    stars = [];
    placePlatforms();
    generateStars();
}
