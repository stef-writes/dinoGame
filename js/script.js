const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let trexImage = new Image();
trexImage.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chromium_T-Rex-error-offline.svg';

let obstacleImages = {
    iceAge: new Image(),
    homoHabilis: new Image()
};

obstacleImages.iceAge.src = 'images/iceage-logo.svg';
obstacleImages.homoHabilis.src = 'images/homo-habilis.svg';

let trex = {
    x: 50,
    y: 260,
    width: 40,
    height: 40,
    velocityY: 0,
    gravity: 0.9,
    isJumping: false
};

let obstacles = [];
let frameCount = 0;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Game speed settings
const baseSpeed = 5;
const speedIncrease = 0.1; // Speed increase per point
const maxSpeed = 15; // Maximum speed cap

function getCurrentSpeed() {
    return Math.min(baseSpeed + (score * speedIncrease), maxSpeed);
}

function restartGame() {
    trex.y = 260;
    trex.velocityY = 0;
    trex.isJumping = false;
    obstacles = [];
    frameCount = 0;
    score = 0;
    isGameOver = false;
    gameLoop();
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

document.addEventListener('keydown', function (event) {
    if (isGameOver && (event.key === ' ' || event.key === 'ArrowUp')) {
        restartGame();
    } else if ((event.key === ' ' || event.key === 'ArrowUp') && !trex.isJumping && !isGameOver) {
        jump();
    }
});

document.addEventListener('touchstart', function () {
    if (isGameOver) {
        restartGame();
    } else if (!trex.isJumping && !isGameOver) {
        jump();
    }
});

function jump() {
    trex.isJumping = true;
    trex.velocityY = -15;
}

function update() {
    if (isGameOver) return;

    // Apply gravity
    trex.velocityY += trex.gravity;
    trex.y += trex.velocityY;

    if (trex.y >= 260) {
        trex.y = 260;
        trex.isJumping = false;
        trex.velocityY = 0;
    }

    // Spawn obstacles
    if (frameCount % 150 === 0) {
        let obstacle = {
            x: canvas.width,
            y: 270,
            width: 40,
            height: 40,
            type: Math.random() < 0.5 ? 'iceAge' : 'homoHabilis'  // Randomly choose obstacle type
        };
        obstacles.push(obstacle);
    }

    // Update obstacles with current speed
    const currentSpeed = getCurrentSpeed();
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= currentSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Check for collision
        if (
            trex.x < obstacle.x + obstacle.width &&
            trex.x + trex.width > obstacle.x &&
            trex.y < obstacle.y + obstacle.height &&
            trex.y + trex.height > obstacle.y
        ) {
            isGameOver = true;
            updateHighScore();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Trex
    ctx.drawImage(trexImage, trex.x, trex.y, trex.width, trex.height);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImages[obstacle.type], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw score and speed
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, 20, 60);
    ctx.fillText(`Speed: ${Math.round(getCurrentSpeed())}`, 20, 90);

    // Draw game over text
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space or Tap to Restart', canvas.width / 2 - 100, canvas.height / 2 + 40);
        if (score === highScore) {
            ctx.fillStyle = 'green';
            ctx.fillText('New High Score!', canvas.width / 2 - 70, canvas.height / 2 - 40);
        }
    }
}

function gameLoop() {
    frameCount++;
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

requestAnimationFrame(gameLoop); 