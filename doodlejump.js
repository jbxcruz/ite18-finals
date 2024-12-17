

// Game Variables
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let boardWidth = 400;
let boardHeight = 600;
canvas.width = boardWidth;
canvas.height = boardHeight;

let playerWidth = 50;
let playerHeight = 50;
let playerX = boardWidth / 2 - playerWidth / 2;
let playerY = boardHeight - playerHeight - 10;
let playerImg = new Image();
playerImg.src = "player.png"; // Replace with actual player image

let velocityY = 0;
let gravity = 0.5;

let platformArray = [];
let platformWidth = 70;
let platformHeight = 20;
let platformImg = new Image();
platformImg.src = "platform.png"; // Replace with actual platform image

let breakablePlatformImg = new Image();
breakablePlatformImg.src = "breakable_platform.png"; // Replace with actual breakable platform image

let score = 0;
let gameOver = false;

// Initialize the game
window.onload = function () {
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
};

function update() {
    if (gameOver) return;

    requestAnimationFrame(update);
    ctx.clearRect(0, 0, boardWidth, boardHeight);

    // Player physics
    velocityY += gravity;
    playerY += velocityY;

    if (playerY > boardHeight) {
        gameOver = true;
        alert("Game Over! Final Score: " + score);
        return;
    }

    // Check for platform collision
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (
            playerY + playerHeight <= platform.y && // Above platform
            playerY + playerHeight + velocityY >= platform.y && // Moving downward
            playerX + playerWidth > platform.x && // Within platform's width
            playerX < platform.x + platform.width
        ) {
            velocityY = -10; // Bounce effect
            score++;

            // Remove breakable platform after landing
            if (platform.isBreakable) {
                platformArray.splice(i, 1);
                i--;
            }
        }
        // Move platforms downward as the player ascends
        platform.y += velocityY > 0 ? 0 : 2;

        // Remove platforms that exit the screen
        if (platform.y > boardHeight) {
            platformArray.splice(i, 1);
            i--;
            newPlatform(); // Add a new platform
        }
    }

    // Draw platforms
    for (let platform of platformArray) {
        ctx.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Draw player
    ctx.drawImage(playerImg, playerX, playerY, playerWidth, playerHeight);

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

function movePlayer(e) {
    if (e.key === "ArrowLeft" && playerX > 0) {
        playerX -= 20;
    } else if (e.key === "ArrowRight" && playerX + playerWidth < boardWidth) {
        playerX += 20;
    }
}

function placePlatforms() {
    platformArray = [];

    // First platform at the bottom
    let platform = {
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2, // Center platform horizontally
        y: boardHeight - platformHeight - 10,  // Place it just above the bottom edge
        width: platformWidth,
        height: platformHeight,
        isBreakable: false
    };
    platformArray.push(platform);

    // Generate initial platforms evenly spaced
    const minVerticalDistance = 80; // Reduced spacing
    for (let i = 1; i < 10; i++) { // Generate 10 platforms initially
        let randomX = Math.random() * (boardWidth - platformWidth);
        let randomY = boardHeight - (i * minVerticalDistance) - Math.random() * 30;

        let isBreakable = Math.random() < 0.2; // 20% chance for breakable platform

        platform = {
            img: isBreakable ? breakablePlatformImg : platformImg,
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
    // Generate a new platform at the top
    let randomX = Math.random() * (boardWidth - platformWidth);
    let randomY = -platformHeight;

    let isBreakable = Math.random() < 0.2; // 20% chance for breakable platform

    let platform = {
        img: isBreakable ? breakablePlatformImg : platformImg,
        x: randomX,
        y: randomY,
        width: platformWidth,
        height: platformHeight,
        isBreakable: isBreakable
    };

    platformArray.push(platform);
}
