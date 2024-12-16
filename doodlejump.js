


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

// Velocity and gravity settings
let jumpVelocity = -8;  // Initial upward velocity for jumping
let bounceGravity = 0.3; // Reduced gravity when going up (to make the jump faster)
let fallGravity = 0.6;   // Increased gravity when falling (to make the fall slower)

let velocityX = 0;
let velocityY = 0;

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let breakablePlatformImg = new Image(); // Declare a new image for breakable platforms
breakablePlatformImg.src = './breakable-platform.png'; // Use your image URL here

let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
let gameOver = false;

let playerName = "";
let highScore = 0;

window.onload = function () {
    // Prompt for player name
    playerName = prompt("Enter your name:");
    if (!playerName) {
        playerName = "Player";
    }

    // Setup the board
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    board.style.margin = "auto";
    board.style.display = "block";

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    };

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = jumpVelocity;
    placePlatforms();
    generateStars();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    drawStars();

    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += (velocityY < 0 ? bounceGravity : fallGravity);
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        // Detect if the player is on a breakable platform
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                // Remove the platform (make it disappear)
                platformArray.splice(i, 1);
                i--; // Adjust index because the array is modified
                velocityY = jumpVelocity; // Reset upward velocity to simulate jumping again
            } else {
                // If it's not a breakable platform, simulate the jump
                velocityY = jumpVelocity;
            }
        }

        // Draw the platform
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove off-screen platforms
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(`${playerName}'s score: ${score}`, 5, 20);
    context.fillText(`High Score: ${highScore}`, boardWidth - 120, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
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
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    for (let i = 1; i <= 6; i++) {
        let randomX = Math.random() * (boardWidth - platformWidth);
        let randomY = boardHeight - i * 100;

        let isBreakable = Math.random() < 0.2; // 20% chance for a breakable platform

        let platform = {
            img: isBreakable ? breakablePlatformImg : platformImg, // Use the breakable platform image if it's breakable
            x: randomX,
            y: randomY,
            width: platformWidth,
            height: platformHeight,
            isBreakable: isBreakable
        };
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.random() * (boardWidth - platformWidth);
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight,
        isBreakable: Math.random() < 0.2 // 20% chance for a breakable platform
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
    if (velocityY < 0) {
        score += 1;  // Increase score when going up (bouncing upwards)
    }

    if (score > highScore) {
        highScore = score; // Update high score if current score exceeds the high score
    }
}

function generateStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * boardWidth,
            y: Math.random() * boardHeight,
            radius: Math.random() * 2
        });
    }
}

function drawStars() {
    context.fillStyle = "white";
    for (let star of stars) {
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        context.fill();
    }
}
