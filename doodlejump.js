

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
let initialVelocityY = -6; 
let gravity = 0.4;

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

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
        platform.y -= Math.abs(initialVelocityY); // Slide platforms smoothly
    }
    if (
        velocityY > 0 && // Doodler is falling
        doodler.y + doodler.height >= platform.y && // Bottom of doodler reaches platform's top
        doodler.y + doodler.height - velocityY <= platform.y && // Ensure landing detection
        doodler.x + doodler.width > platform.x && // Horizontal overlap
        doodler.x < platform.x + platform.width
    ) {
        velocityY = initialVelocityY; // Reset upward velocity for consistent bounce
        doodler.y = platform.y - doodler.height; // Align doodler to platform
    }
    context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
}


    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // removes first element from the array
        newPlatform(); // replace with new platform on top
    }

    // Score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(`Score: ${score}`, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { // move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") { // move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
        // reset
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
        height: platformHeight
    };
    platformArray.push(platform);

    for (let i = 1; i <= 6; i++) {
        let randomX = Math.random() * (boardWidth - platformWidth); 
        let randomY = boardHeight - i * 100; 

        platform = {
            img: platformImg,
            x: randomX,
            y: randomY,
            width: platformWidth,
            height: platformHeight
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
        height: platformHeight
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
    // Update score only if the player has reached a new height (max upward progress)
    if (doodler.y < boardHeight * 3 / 4) {
        maxScore = Math.max(maxScore, Math.floor(boardHeight * 3 / 4 - doodler.y));
        score = maxScore; // The score represents the farthest upward distance
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
