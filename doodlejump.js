
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
let jumpVelocity = -9;
let bounceGravity = 0.3;
let fallGravity = 0.8;

let platformArray = [];
let platformWidth = 80;
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
    // Prompt for the player's name and limit to 8 characters
    playerName = prompt("Enter your name (Max 8 characters):");
    playerName = playerName ? playerName.substring(0, 8) : "Player"; // Limit to 8 characters

    // Your existing board and game setup code follows
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

    // Draw background stars
    drawStars();

    // Apply Doodler movement
    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    // Apply gravity to the Doodler
    if (velocityY < 0) {
        velocityY += bounceGravity;
    } else {
        velocityY += fallGravity;
    }
    doodler.y += velocityY;

    // Camera adjustment when the Doodler crosses the threshold
const doodlerThreshold = boardHeight / 2; // Doodler threshold stays in the middle of the screen
if (doodler.y < doodlerThreshold) {
    const offset = doodlerThreshold - doodler.y;
    doodler.y = doodlerThreshold;

    // Move platforms down by the same offset
    for (let platform of platformArray) {
        platform.y += offset;
    }

    // Adjust stars' positions visually without changing their background role
    for (let star of stars) {
        star.y = (star.y + offset) % boardHeight;
    }

    // Increment score based on upward movement
    score += offset * 0.1; // Adjust this multiplier for balanced scoring
}


    // Prevent the Doodler from falling off the screen
    if (doodler.y > boardHeight) gameOver = true;

    // Draw the Doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Handle platform collisions and update positions
    let toRemove = [];
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        // Detect collision
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                toRemove.push(i);
            }
            velocityY = jumpVelocity; // Reset jump velocity on platform collision
        }

        // Draw platform
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove platforms marked for removal
    for (let index of toRemove) {
        platformArray.splice(index, 1);
    }

    // Remove off-screen platforms and generate new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    updateScore();
    displayText();

    // Display game-over screen if applicable
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

    const minVerticalDistance = 50; // Reduced spacing for denser platforms
    const minHorizontalSpacing = 50;
    let currentX = platform.x;

    for (let i = 1; i <= 15; i++) { // Increased initial platform count
        let randomX = Math.random() * (boardWidth - platformWidth);
        let randomY = boardHeight - (i * minVerticalDistance) - Math.random() * 50;

        while (Math.abs(currentX - randomX) < minHorizontalSpacing) {
            randomX = Math.random() * (boardWidth - platformWidth);
        }

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
        currentX = randomX;
    }
}




function newPlatform() {
    const minJumpableDistance = 30; // Minimum vertical distance that ensures platforms are jumpable
    const maxJumpableDistance = 60; // Maximum vertical distance between platforms

    let randomX = Math.random() * (boardWidth - platformWidth);
    let randomY = -Math.random() * (maxJumpableDistance - minJumpableDistance) - minJumpableDistance;

    // Ensure no overlap with existing platforms
    let overlapping;
    do {
        overlapping = false;
        randomX = Math.random() * (boardWidth - platformWidth);

        // Check against all existing platforms for overlap
        for (let platform of platformArray) {
            if (
                randomX < platform.x + platform.width &&
                randomX + platformWidth > platform.x &&
                randomY < platform.y + platform.height &&
                randomY + platformHeight > platform.y
            ) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);

    // Randomly decide if the platform is breakable
    let isBreakable = Math.random() < 0.2; // 20% chance for breakable platform

    // Create the new platform
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
    context.font = "16px 'Gloria Hallelujah', cursive";
    context.fillText(`${playerName} ${Math.floor(score)}`, 5, 20);
}

function displayGameOver() {
    context.fillStyle = "white";
    context.font = "'25 px Gloria Hallelujah', cursive";

    // Display the High Score at the top
    context.fillText(`High Score: ${Math.floor(highScore)}`, boardWidth / 2 - 100, 30);

    // Display the Game Over message
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 2 - 150, boardHeight / 2);

    // Display the final score
    context.fillText(`Your final score is ${Math.floor(score)}`, boardWidth / 2 - 100, boardHeight * 3 / 4);

    // Display the High Score again at the bottom
    context.fillText(`High Score: ${Math.floor(highScore)}`, boardWidth / 2 - 100, boardHeight * 3 / 4 + 30);
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
        context.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
        context.fill();
    }
}
