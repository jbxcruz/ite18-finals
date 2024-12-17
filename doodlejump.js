
let basePlatform; // Starting ground platform
let hasAscended = false; // Flag to remove the base platform once the player ascends
let platformGap = 100; // Minimum vertical distance between platforms


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
let jumpVelocity = -6;  // Initial upward velocity for jumping
let bounceGravity = 0.3; // Reduced gravity when going up (to make the jump faster)
let fallGravity = 0.6;   // Increased gravity when falling (to make the fall slower)

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let breakablePlatformImg = new Image();
breakablePlatformImg.src = "./platform-broken.png"; // Image for breakable platforms

let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
let gameOver = false;
let highScore = 0; // Track high score
let playerName = ''; // Store player's name
let lastYPosition = doodlerY; // Track the last Y position to detect upward movement

window.onload = function () {
    playerName = prompt("Enter your name:"); // Ask for the player's name
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
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);
    drawStars();

    // Doodler Movement and Gravity
    doodler.x += velocityX;
    if (doodler.x > boardWidth) doodler.x = 0;
    else if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    velocityY += (velocityY < 0 ? bounceGravity : fallGravity);
    doodler.y += velocityY;

    // Remove bottom platform if the player ascends
    if (doodler.y < boardHeight * 0.7) hasAscended = true;

    if (hasAscended) {
        platformArray = platformArray.filter(p => p !== basePlatform);
    }

    if (doodler.y > board.height) {
        gameOver = true;
    }

    // Draw Doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Update Platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        if (velocityY < 0 && doodler.y < boardHeight * 0.5) {
            platform.y -= jumpVelocity; // Move platforms downward when player ascends
        }

        // Collision Detection
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                platformArray.splice(i, 1); // Remove broken platform
                i--;
            }
            velocityY = jumpVelocity; // Jump on collision
        }

        // Draw platform
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove off-screen platforms and generate new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    // Update Score
    updateScore();
    context.fillStyle = "white";
    context.font = "16px sans-serif";
    context.fillText(`${playerName}'s Score: ${score}`, 5, 20);
    context.fillText(`High Score: ${highScore}`, boardWidth - 120, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
        context.fillText(`Your final score is ${score}`, boardWidth / 4, boardHeight / 2);
    }
}



    // Update score and display it with player name
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(`${playerName}'s Score: ${score}`, 5, 20);

    // Display high score at the top-right corner
    context.fillText(`High Score: ${highScore}`, boardWidth - 120, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
        context.fillText(`Your final score is ${score}`, boardWidth / 4, boardHeight / 2);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { // Move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") { // Move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
        // Reset
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
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}


function placePlatforms() {
    platformArray = [];

    // Add a solid bottom platform (base) at the start
    basePlatform = {
        img: platformImg,
        x: 0,
        y: boardHeight - 10, // Ground platform at the very bottom
        width: boardWidth,
        height: 10, // Thin ground
        isBreakable: false
    };
    platformArray.push(basePlatform);

    // Generate additional platforms
    let currentY = boardHeight - 100; // Start positioning from the bottom
    for (let i = 0; i < 6; i++) {
        let randomX = Math.random() * (boardWidth - platformWidth);
        let isBreakable = Math.random() < 0.2; // 20% chance for breakable platform

        let platform = {
            img: isBreakable ? breakablePlatformImg : platformImg,
            x: randomX,
            y: currentY,
            width: platformWidth,
            height: platformHeight,
            isBreakable: isBreakable
        };

        platformArray.push(platform);
        currentY -= platformGap + Math.random() * 30; // Adjust Y spacing with randomness
    }
}




function newPlatform() {
    let randomX = Math.random() * (boardWidth - platformWidth);
    let isBreakable = Math.random() < 0.2; // 20% chance for broken platform
    let platform = {
        img: isBreakable ? breakablePlatformImg : platformImg,
        x: randomX,
        y: -platformHeight, // Start off-screen
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



let highestY = doodlerY; // Track the highest Y position reached

function updateScore() {
    if (doodler.y < highestY) { // Player is moving upwards
        score += Math.floor(highestY - doodler.y); // Increment score based on upward progress
        highestY = doodler.y; // Update the highest Y position
    }

    // Update high score if current score exceeds it
    if (score > highScore) {
        highScore = score;
    }
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
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        context.fillStyle = "white";
        context.beginPath();
        context.arc(star.x, star.y, 2, 0, 2 * Math.PI);
        context.fill();
    }
}
