

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
let initialVelocityY = -8; 
let gravity = 0.4;

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;
let brokenPlatformImg;

let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
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
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    };

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    brokenPlatformImg = new Image();
    brokenPlatformImg.src = "./platform-broken.png";

    velocityY = initialVelocityY;
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

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY; //slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            if (platform.type === "broken") {
                // Skip jumping if platform is broken
                continue;
            } else {
                velocityY = initialVelocityY; //jump
            }
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
        //reset
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        };

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
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
        type: "normal" // Default platform type is normal
    };
    platformArray.push(platform);

    for (let i = 1; i <= 6; i++) {
        newPlatform(); // Use the updated newPlatform function to create platforms
    }
}

function newPlatform() {
    let randomX = Math.random() * (boardWidth - platformWidth); // Random X position

    // Determine platform probability based on current score
    let platformType = "normal"; // Default is normal platform
    if (score >= 800) {
        // 50% chance for normal, 50% chance for broken
        platformType = Math.random() < 0.5 ? "broken" : "normal";
    } else if (score >= 300) {
        // 60% chance for normal, 40% chance for broken
        platformType = Math.random() < 0.4 ? "broken" : "normal";
    } else {
        // 80% chance for normal, 20% chance for broken
        platformType = Math.random() < 0.2 ? "broken" : "normal";
    }

    // Create platform with selected type
    let platform = {
        img: platformType === "broken" ? brokenPlatformImg : platformImg, // Assign image based on platform type
        x: randomX,
        y: -platformHeight, // Start off-screen
        width: platformWidth,
        height: platformHeight,
        type: platformType // Store platform type (normal or broken)
    };

    platformArray.push(platform); // Add platform to array
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
        a.x + a.width > b.x &&   
        a.y < b.y + b.height &&  
        a.y + a.height > b.y;    
}

function updateScore() {
    let points = Math.floor(50 * Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    } else if (velocityY >= 0) {
        maxScore -= points;
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

        star.y += 0.5;
        if (star.y > boardHeight) {
            star.y = 0;
            star.x = Math.random() * boardWidth;
        }
    }
}
