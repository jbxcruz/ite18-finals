


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
let breakablePlatformImg; // New image for breakable platforms

let stars = [];
let numStars = 100;

let score = 0;
let maxScore = 0;
let gameOver = false;
let highScore = 0; // Track high score
let playerName = ''; // Store player's name
let lastYPosition = doodlerY; // Track the last Y position to detect upward movement

let platformSpawnRate = 0.8; // 80% chance to spawn a platform
let breakablePlatformRate = 0.5; // 50% chance for a platform to be breakable

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

    breakablePlatformImg = new Image(); // Set image for breakable platforms
    breakablePlatformImg.src = "./breakable-platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    generateStars();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
};

function placePlatforms() {
    platformArray = [];

    // First platform (always spawn)
    let platform = {
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - platformHeight - 10,
        width: platformWidth,
        height: platformHeight,
        isBreakable: false
    };
    platformArray.push(platform);

    // Spawn additional platforms based on spawn rate
    for (let i = 1; i <= 6; i++) {
        if (Math.random() < platformSpawnRate) { // Check spawn rate
            let randomX = Math.random() * (boardWidth - platformWidth); 
            let randomY = boardHeight - i * 100; 

            // Decide if the platform will be breakable based on breakable platform rate
            let isBreakable = Math.random() < breakablePlatformRate; // Adjust this percentage

            platform = {
                img: isBreakable ? breakablePlatformImg : platformImg,  // Use breakable platform image if isBreakable is true
                x: randomX,
                y: randomY,
                width: platformWidth,
                height: platformHeight,
                isBreakable: isBreakable
            };

            platformArray.push(platform);
        }
    }
}

function update() {
    // ... rest of your update function remains the same
}

// Rest of the game logic, including collision detection, score tracking, etc.
