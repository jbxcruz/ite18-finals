

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
let jumpVelocity = -8;  // Initial upward velocity for jumping
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

    velocityY += (velocityY < 0 ? bounceGravity : fallGravity); // Adjust gravity depending on direction
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= jumpVelocity; // Slide platform down
        }

        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.isBreakable) {
                // Remove breakable platform and stop the player from jumping again
                platformArray.splice(i, 1);
                i--; // Adjust index because we removed an element
                velocityY = jumpVelocity; // Reset the velocity to simulate a jump
            } else {
                velocityY = jumpVelocity; // Regular jump
            }
        }

        // Draw the platform
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove off-screen platforms
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // Removes first element from the array
        newPlatform(); // Replace with new platform on top
    }

    // Update score and display it with player name
    updateScore();
    context.fillStyle = "white";
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

    // Create the first platform at the bottom of the screen
    let platform = {
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - platformHeight - 10,
        width: platformWidth,
        height: platformHeight,
        isBreakable: false // This platform is not breakable
    };
    platformArray.push(platform);

    // Create 6 more platforms at random heights, with breakable platform randomness
    for (let i = 1; i <= 6; i++) {
        let randomX = Math.random() * (boardWidth - platformWidth); // Random X position 
        let randomY = boardHeight - (i * 100); // Positioning platforms progressively upwards

        // 50% chance for a breakable platform
        let isBreakable = Math.random() < 0.5; // Adjust this percentage as needed

        platform = {
            img: isBreakable ? breakablePlatformImg : platformImg, // Use breakable platform image if isBreakable is true
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
    let randomX = Math.random() * (boardWidth - platformWidth); // Random X position
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight, 
        width: platformWidth,
        height: platformHeight,
        isBreakable: false
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
    // Increase the score when the player is going upwards
    if (doodler.y < lastYPosition) {
        score += 1; // Increment the score as the player goes up
        maxScore = score > maxScore ? score : maxScore; // Track max score during the game session
    }

    // Update high score if current score exceeds it
    if (score > highScore) {
        highScore = score;
    }

    lastYPosition = doodler.y; // Update last Y position for the next frame
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

        star.y += 0.5;
        if (star.y > boardHeight) {
            star.y = 0;
            star.x = Math.random() * boardWidth;
        }
    }
}
