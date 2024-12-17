

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
let bounceGravity = 0.2;
let fallGravity = 0.6;

let platformArray = [];
let platformWidth = 100;
let platformHeight = 18;
let platformImg;
let breakablePlatformImg;

let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
let gameOver = false;
let highScore = 0;
let playerName = '';
let lastYPosition = doodlerY;

window.onload = function () {
    playerName = prompt("Enter your name:") || "Player";
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    board.style.margin = "auto";
    board.style.display = "block";

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";
    platformImg = new Image();
    platformImg.src = "./platform.png";
    breakablePlatformImg = new Image();
    breakablePlatformImg.src = "./platform-broken.png";

    doodler.img = doodlerRightImg;
    velocityY = jumpVelocity;

    // Ensure images are loaded
    doodlerRightImg.onload = function () {
        platformImg.onload = function () {
            placePlatforms();
            generateStars();
            requestAnimationFrame(update);
        };
    };

    document.addEventListener("keydown", moveDoodler);
};


function update() {
    if (gameOver) return;

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    drawStars();

    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    velocityY += velocityY < 0 ? bounceGravity : fallGravity;
    doodler.y += velocityY;

    if (doodler.y > boardHeight) gameOver = true;

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    let toRemove = [];
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= jumpVelocity;
        }

        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                toRemove.push(i);
            }
            velocityY = jumpVelocity;
        }

        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    for (let index of toRemove) {
        platformArray.splice(index, 1);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    updateScore();
    displayText();

    if (gameOver) {
        displayGameOver();
    }
}


    
function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code === "Space") {
        if (gameOver) {
            resetGame();
            requestAnimationFrame(update); // Restart the game loop
        }
    }
}



function placePlatforms() {
    platformArray = [];
    let platform = {
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - platformHeight - 10,
        width: platformWidth,
        height: platformHeight,
        isBreakable: false
    };
    platformArray.push(platform);

    const minVerticalDistance = 100; // Minimum y-axis spacing
    const maxVerticalDistance = 150; // Maximum y-axis spacing
    const minHorizontalSpacing = 70; // Minimum x-axis spacing
    let currentX = platform.x;
    let currentY = platform.y;

    for (let i = 1; i <= 6; i++) {
        // Randomize vertical spacing
        let randomY = currentY - (Math.random() * (maxVerticalDistance - minVerticalDistance) + minVerticalDistance);
        
        // Randomize horizontal position with spacing
        let randomX = Math.random() * (boardWidth - platformWidth);
        while (Math.abs(currentX - randomX) < minHorizontalSpacing) {
            randomX = Math.random() * (boardWidth - platformWidth);
        }

        // Add breakable platforms with 20% probability
        let isBreakable = Math.random() < 0.2;

        platform = {
            img: isBreakable ? breakablePlatformImg : platformImg,
            x: randomX,
            y: randomY,
            width: platformWidth,
            height: platformHeight,
            isBreakable: isBreakable
        };

        platformArray.push(platform);
        currentX = randomX;
        currentY = randomY;
    }
}



function placePlatforms() {
    platformArray = [];
    let platform = {
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - platformHeight - 8,
        width: platformWidth,
        height: platformHeight,
        isBreakable: false
    };
    platformArray.push(platform);

    const minVerticalDistance = 80; // Reduced spacing for denser platforms
    const minHorizontalSpacing = 60;
    let currentX = platform.x;

    for (let i = 1; i <= 10; i++) { // Increased initial platform count
        let randomX = Math.random() * (boardWidth - platformWidth);
        let randomY = boardHeight - (i * minVerticalDistance) - Math.random() * 80;

        while (Math.abs(currentX - randomX) < minHorizontalSpacing) {
            randomX = Math.random() * (boardWidth - platformWidth);
        }

        let isBreakable = Math.random() < 0.3; // 20% chance for breakable platform

        platform = {
            img: isBreakable ? breakablePlatformImg : platformImg,
            x: randomX,
            y: randomY,
            width: platformWidth,
            height: platformHeight,
            isBreakable: isBreakable
        };

        platformArray.push(platform);
        currentX = randomX;
    }
}

function newPlatform() {
    let randomX = Math.random() * (boardWidth - platformWidth);
    let isBreakable = Math.random() < 0.3; // 20% chance for breakable platform
    let platform = {
        img: isBreakable ? breakablePlatformImg : platformImg,
        x: randomX,
        y: -platformHeight / 2,
        width: platformWidth,
        height: platformHeight,
        isBreakable: isBreakable
    };
    platformArray.push(platform);
}





function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function updateScore() {
    let scoreIncrementRate = 0.5;
    if (doodler.y < lastYPosition) {
        score += scoreIncrementRate;
        lastYPosition = doodler.y;
    }
    if (score > highScore) highScore = score;
}

function displayText() {
    context.fillStyle = "white";
    context.font = "16px sans-serif";
    context.fillText(`${playerName}'s Score: ${Math.floor(score)}`, 5, 20);
    context.fillText(`High Score: ${Math.floor(highScore)}`, boardWidth - 120, 20);
}

function displayGameOver() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";

    let gameOverText = "Game Over: Press 'Space' to Restart";
    let scoreText = `Your final score is ${Math.floor(score)}`;

    let gameOverTextWidth = context.measureText(gameOverText).width;
    let scoreTextWidth = context.measureText(scoreText).width;

    context.fillText(gameOverText, (boardWidth - gameOverTextWidth) / 2, boardHeight / 2);
    context.fillText(scoreText, (boardWidth - scoreTextWidth) / 2, boardHeight / 2 + 30);
}


function resetGame() {
    doodler = {
        img: doodlerRightImg,
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight
    };
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
