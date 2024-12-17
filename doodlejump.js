
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
};

let velocityX = 0;
let velocityY = 0;
let jumpVelocity = -6;
let bounceGravity = 0.3;
let fallGravity = 0.6;

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let breakablePlatformImg = new Image();
breakablePlatformImg.src = "./platform-broken.png";

let stars = [];
let numStars = 100;

let score = 0;
let highScore = 0;
let maxYPosition = doodlerY; // Track the maximum Y position the player reaches
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    board.style.margin = "auto";
    board.style.display = "block";

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = jumpVelocity;
    placeInitialPlatforms();
    generateStars();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);
    drawStars();

    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    else if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    // Apply gravity
    velocityY += (velocityY < 0 ? bounceGravity : fallGravity);
    doodler.y += velocityY;

    // Check if doodler falls off the screen
    if (doodler.y > board.height) gameOver = true;

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        // Move platforms down if player ascends
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= jumpVelocity;
        }

        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                platformArray.splice(i, 1);
                i--;
            }
            velocityY = jumpVelocity; // Bounce up
        }

        // Draw platforms
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove off-screen platforms and generate new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        generateNewPlatform();
    }

    updateScore();
    displayScores();

    if (gameOver) displayGameOver();
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
    }
}

function placeInitialPlatforms() {
    platformArray = [];
    let initialY = boardHeight - platformHeight - 10;

    for (let i = 0; i < 7; i++) {
        let platform = {
            img: platformImg,
            x: Math.random() * (boardWidth - platformWidth),
            y: initialY - i * 100,
            width: platformWidth,
            height: platformHeight,
            isBreakable: false
        };
        platformArray.push(platform);
    }
}

function generateNewPlatform() {
    let isBreakable = Math.random() < 0.2; // 20% chance of breakable platform
    let platform = {
        img: isBreakable ? breakablePlatformImg : platformImg,
        x: Math.random() * (boardWidth - platformWidth),
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight,
        isBreakable: isBreakable
    };
    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateScore() {
    if (doodler.y < maxYPosition) {
        score += Math.round(maxYPosition - doodler.y); // Only increase when moving upwards
        maxYPosition = doodler.y;
    }
}

function displayScores() {
    context.fillStyle = "white";
    context.font = "16px Arial";
    context.fillText(`Score: ${score}`, 5, 20);
    context.fillText(`High Score: ${highScore}`, boardWidth - 120, 20);

    if (score > highScore) highScore = score;
}

function displayGameOver() {
    context.fillStyle = "red";
    context.font = "20px Arial";
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 8, boardHeight / 2);
    context.fillText(`Your Final Score: ${score}`, boardWidth / 3.5, boardHeight / 2 + 30);
}

function resetGame() {
    doodler.x = boardWidth / 2 - doodlerWidth / 2;
    doodler.y = boardHeight * 7 / 8 - doodlerHeight;
    velocityX = 0;
    velocityY = jumpVelocity;
    score = 0;
    maxYPosition = doodler.y;
    gameOver = false;
    placeInitialPlatforms();
}

function generateStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * boardWidth,
            y: Math.random() * boardHeight
        });
    }
}

function drawStars() {
    for (let star of stars) {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(star.x, star.y, 2, 0, 2 * Math.PI);
        context.fill();
    }
}


