


let board, context;
let boardWidth = 360, boardHeight = 576;

let doodlerWidth = 46, doodlerHeight = 46;
let doodler = { x: boardWidth / 2 - doodlerWidth / 2, y: boardHeight * 7 / 8 - doodlerHeight, width: doodlerWidth, height: doodlerHeight, img: null };

let velocityX = 0, velocityY = -9;
const jumpVelocity = -9, bounceGravity = 0.3, fallGravity = 0.8;

const platformWidth = 80, platformHeight = 18;
let platformArray = [];
const stars = [];
const numStars = 30; // Reduce stars for better performance

let score = 0, highScore = 0, gameOver = false, playerName = "Player";
const platformImg = new Image(), breakablePlatformImg = new Image(), doodlerRightImg = new Image(), doodlerLeftImg = new Image();

// Preload images
platformImg.src = "./platform.png";
breakablePlatformImg.src = "./platform-broken.png";
doodlerRightImg.src = "./doodler-right.png";
doodlerLeftImg.src = "./doodler-left.png";

window.onload = function () {
    playerName = prompt("Enter your name (Max 8 characters):") || "Player";
    playerName = playerName.substring(0, 8);

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    doodler.img = doodlerRightImg;

    doodlerRightImg.onload = () => {
        placePlatforms();
        generateStars();
        velocityY = jumpVelocity;
        requestAnimationFrame(update);
    };

    document.addEventListener("keydown", moveDoodler);
};

function update() {
    if (gameOver) return;

    context.clearRect(0, 0, boardWidth, boardHeight);

    // Render stars (skip stars not visible on the canvas)
    drawStars();

    // Handle Doodler logic
    moveDoodlerHorizontally();
    applyGravity();
    adjustCamera();

    // End game if Doodler falls off
    if (doodler.y > boardHeight) {
        gameOver = true;
        displayGameOver();
        return;
    }

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Handle platforms
    updatePlatforms();

    // Score display
    updateScore();
    displayText();

    // Request next animation frame
    requestAnimationFrame(update);
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
    const cameraThreshold = boardHeight / 2;
    if (doodler.y < cameraThreshold) {
        const offset = cameraThreshold - doodler.y;
        doodler.y = cameraThreshold;

        platformArray.forEach((platform) => (platform.y += offset));
        stars.forEach((star) => (star.y += offset));

        score += offset * 0.1;
    }
}

function updatePlatforms() {
    platformArray = platformArray.filter((platform) => platform.y < boardHeight); // Remove off-screen platforms

    for (let platform of platformArray) {
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = jumpVelocity;
            if (platform.isBreakable) platformArray.splice(platformArray.indexOf(platform), 1);
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length < 10) {
        addNewPlatform();
    }
}

function placePlatforms() {
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (boardWidth - platformWidth);
        const y = boardHeight - (i + 1) * 60;
        platformArray.push({ x, y, width: platformWidth, height: platformHeight, img: platformImg, isBreakable: false });
    }
}

function addNewPlatform() {
    const x = Math.random() * (boardWidth - platformWidth);
    const y = -platformHeight - Math.random() * 100;
    const isBreakable = Math.random() < 0.2;
    platformArray.push({ x, y, width: platformWidth, height: platformHeight, img: isBreakable ? breakablePlatformImg : platformImg, isBreakable });
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function generateStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push({ x: Math.random() * boardWidth, y: Math.random() * boardHeight });
    }
}

function drawStars() {
    for (let star of stars) {
        if (star.y >= 0 && star.y <= boardHeight) { // Only draw stars in view
            context.fillStyle = "white";
            context.beginPath();
            context.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
            context.fill();
        }
    }
}

function updateScore() {
    highScore = Math.max(highScore, score);
}

function displayText() {
    context.fillStyle = "white";
    context.font = "16px Arial";
    context.fillText(`${playerName}: ${Math.floor(score)}`, 5, 20);
}

function displayGameOver() {
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Game Over! Press Space to Restart", 50, boardHeight / 2);
    context.fillText(`Score: ${Math.floor(score)}`, 50, boardHeight / 2 + 30);
    context.fillText(`High Score: ${Math.floor(highScore)}`, 50, boardHeight / 2 + 60);
}

function resetGame() {
    doodler.x = boardWidth / 2 - doodlerWidth / 2;
    doodler.y = boardHeight * 7 / 8 - doodlerHeight;
    velocityX = 0;
    velocityY = jumpVelocity;
    platformArray = [];
    stars.length = 0;
    score = 0;
    gameOver = false;
    placePlatforms();
    generateStars();
}
