// Get canvas, adjust for device pixel ratio
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

// Game state variables
var score = 0,
    highScore = 0,
    gameRunning = true,
    lastFrameTime = 0;

// Set canvas dimensions properly
function resizeCanvas() {
    // Get the width from CSS
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // Check if the canvas is not the same size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

// Call once at startup
resizeCanvas();

// Handle window resizing
window.addEventListener('resize', function() {
    resizeCanvas();
    resetPlayerPosition();
});

// Player variables - will be set properly after canvas is resized
var x, y, width = 30, height = 30;

// Initialize player position
function resetPlayerPosition() {
    x = canvas.width / 2;
    y = canvas.height - 70; // Position near bottom
}

// Initialize position
resetPlayerPosition();

var rightPressed = false,
     leftPressed = false,
       upPressed = false,
     downPressed = false;

var up    = true,
    down  = true,
    right = true,
     left = true;



var squareWidth = 20;
var squareHeight = 20;

// Add event listeners for keyboard and touch
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

// Variables for touch controls
var touchStartX = 0;
var touchStartY = 0;

// Handle touch controls
function handleTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var touchEndX = touch.clientX;
    var touchEndY = touch.clientY;
    
    var deltaX = touchEndX - touchStartX;
    var deltaY = touchEndY - touchStartY;
    
    // Determine swipe direction based on the larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 20) {
            rightPressed = true;
            setTimeout(function() { rightPressed = false; }, 100);
        } else if (deltaX < -20) {
            leftPressed = true;
            setTimeout(function() { leftPressed = false; }, 100);
        }
    } else {
        // Vertical swipe
        if (deltaY > 20) {
            downPressed = true;
            setTimeout(function() { downPressed = false; }, 100);
        } else if (deltaY < -20) {
            upPressed = true;
            setTimeout(function() { upPressed = false; }, 100);
        }
    }
}

// Modern keyboard input handling using key and code properties
function keyDownHandler(e) {
    // Support both keyCode (legacy) and key/code (modern)
    if (e.key === "Right" || e.key === "ArrowRight" || e.keyCode == 39) {
        rightPressed = true;
    }
    if (e.key === "Left" || e.key === "ArrowLeft" || e.keyCode == 37) {
        leftPressed = true;
    }
    if (e.key === "Up" || e.key === "ArrowUp" || e.keyCode == 38) {
        upPressed = true;
    }
    if (e.key === "Down" || e.key === "ArrowDown" || e.keyCode == 40) {
        downPressed = true;
    }
    // Add restart functionality with 'R' key
    if (e.key === "r" || e.key === "R") {
        resetGame();
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.keyCode == 39) {
        rightPressed = false;
    }
    if (e.key === "Left" || e.key === "ArrowLeft" || e.keyCode == 37) {
        leftPressed = false;
    }
    if (e.key === "Up" || e.key === "ArrowUp" || e.keyCode == 38) {
        upPressed = false;
    }
    if (e.key === "Down" || e.key === "ArrowDown" || e.keyCode == 40) {
        downPressed = false;
    }
}

// Reset game state
function resetGame() {
    score = 0;
    document.getElementById("score").innerHTML = score;
    cars.length = 1;
    y = Math.floor(canvas.height * 0.88); // Position near bottom
    x = canvas.width / 2;
}

// Make the player move with each tap of an arrow key instead of holding down an arrow key
// Uses relative movements based on canvas size for better responsiveness
function moveFrong() {
    // Calculate movement step size based on canvas dimensions
    const stepSizeX = canvas.width * 0.07;
    const stepSizeY = canvas.height * 0.07;
    
    // Minimum step size to ensure movement is noticeable
    const minStep = 15;
    
    // Use the larger of the calculated or minimum step size
    const moveX = Math.max(stepSizeX, minStep);
    const moveY = Math.max(stepSizeY, minStep);
    
    // Move up
    if (upPressed === true && up === true && y > 0) {
        y = y - moveY;
        up = false;
    }
    if (upPressed === false) {
        up = true;
    }
    
    // Move down
    if (downPressed === true && down === true && y + height <= canvas.height - 10) {
        y = y + moveY;
        down = false;
    }
    if (downPressed === false) {
        down = true;
    }
    
    // Move right
    if (rightPressed === true && right === true && x < canvas.width - width) {
        x = x + moveX;
        right = false;
    }
    if (rightPressed === false) {
        right = true;
    }
    
    // Move left
    if (leftPressed === true && left === true && x > 20) {
        x = x - moveX;
        left = false;
    }
    if (leftPressed === false) {
        left = true;
    }
}

// Draws the player character with responsive size
function drawSqaure() {
    // Size relative to canvas for better responsiveness
    const playerSize = Math.max(Math.min(canvas.width, canvas.height) * 0.04, 15);
    
    ctx.beginPath();
    ctx.rect(x, y, playerSize, playerSize);
    ctx.fillStyle = "white";
    ctx.fill();
    
    // Update width and height for collision detection
    width = playerSize;
    height = playerSize;
}

// Class to produce each obstacle with responsive sizing
class Car {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;             // Width of the obstacle
        
        // Make height responsive to canvas size
        this.calculateHeight();
        
        this.baseSpeed = 2;     // Base movement speed
        this.speed = this.baseSpeed;
        this.lastUpdateTime = 0;
        this.color = "#1FF2F2"; // Default color
    }
    
    // Recalculate height based on canvas dimensions
    calculateHeight() {
        this.height = Math.max(canvas.height * 0.04, 20);
    }
    
    // Method which draws the blue rectangles
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.z, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add a subtle border for better visibility
        ctx.strokeStyle = "#0CC7C7";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Method which causes the rectangles to move across the screen consistently
    update(timestamp) {
        // On first update, initialize the time
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = timestamp;
            return;
        }
        
        // Calculate time-based movement for consistent speed across devices
        const deltaTime = (timestamp - this.lastUpdateTime) / 16.67; // Normalize to ~60fps
        this.lastUpdateTime = timestamp;
        
        // Update speed based on score (increases difficulty)
        this.speed = this.baseSpeed + (score / 10);
        
        // Move the obstacle
        if (this.x < canvas.width) {
            // Use deltaTime for frame-rate independent movement
            this.x += this.speed * deltaTime;
        } else {
            // Reset position when off screen
            this.x = -this.z;
            // Randomize the y position for variety
            this.y = randomIntFromInterval(20, canvas.height - 50);
            // Recalculate height in case canvas was resized
            this.calculateHeight();
        }
        
        this.draw();
    }
}

//an array all cars get pushed into from the addCar() function 
var cars =[
    new Car(100, randomIntFromInterval(20, 450), randomIntFromInterval(40, 100)),
];

// Checks if a rectangle and a square are overlapping on the canvas 
function detectCollision() {
    cars.forEach(function (car) {
        // Check if rectangles overlap using standard collision detection
        if (car.x < x + width && 
            car.x + car.z > x && 
            car.y < y + height && 
            car.y + car.height > y) {
            
            // Play collision sound (if supported)
            if (window.AudioContext || window.webkitAudioContext) {
                try {
                    // Simple audio feedback
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
                    oscillator.connect(audioContext.destination);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                } catch (e) {
                    // Ignore audio errors - this is just an enhancement
                    console.log("Audio not supported");
                }
            }
            
            // Reset game state
            resetGame();
        }
    });
}

// Checks for a winner and calls the addCar() function and changes the score
function checkForWinner() {
    const winningLine = 10; // Distance from top to win
    
    if (y < winningLine) {
        score++;
        addCar();

        document.getElementById("score").innerHTML = score;
        
        // Reset player to bottom of screen
        resetPlayerPosition();
    }
}

//generates a random number between a range
function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}


// Displays the obstacles with proper timestamp for frame rate independence
function displaySquares(timestamp){
    cars.forEach(function (car) {
        car.update(timestamp);
    });
}

// Adds obstacles based on the player's score
// Responsive to different screen sizes
function addCar(){
    // Calculate sizes based on canvas dimensions
    const minWidth = Math.max(canvas.width * 0.05, 30);
    const maxWidth = Math.max(canvas.width * 0.15, 80);
    
    // Starting position offscreen to the left
    const startX = -100;
    
    // Height boundaries adjusted for canvas size
    const minY = 20;
    const maxY = canvas.height - 50;
    
    // Add initial cars for new game
    if (score <= 2) {
        cars.push(new Car(
            startX, 
            randomIntFromInterval(minY, maxY), 
            randomIntFromInterval(minWidth, maxWidth)
        ));
    }
    
    // Add cars as score increases (difficulty progression)
    if (score % 4 === 0) {
        cars.push(new Car(
            startX, 
            randomIntFromInterval(minY, maxY), 
            randomIntFromInterval(minWidth, maxWidth)
        ));
    }
    
    // Limit maximum number of cars to prevent overwhelming the player
    // or causing performance issues on slower devices
    const maxCars = 10;
    if (cars.length > maxCars) {
        cars.length = maxCars;
    }
}

//updates the high score on page
function getHighScore(){
    if (score > highScore) {
        highScore = score;
        document.getElementById("highScore").innerHTML = highScore;
    }
}

// Game animation loop with timestamp for frame-rate independent animation
function animate(timestamp) {
    // Request next frame first
    requestAnimationFrame(animate);
    
    // Skip frames if needed for performance on slower devices
    if (timestamp - lastFrameTime < 16) { // Aim for 60fps max
        return;
    }
    
    // Update the last frame time
    lastFrameTime = timestamp;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements and check game logic
    drawSqaure();
    displaySquares(timestamp);
    moveFrong();
    detectCollision();
    getHighScore();
    checkForWinner();
    
    // Draw game boundaries if needed for clarity
    if (score > 5) {
        // Show winning line for visibility at higher difficulty
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(canvas.width, 10);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
    }
};

// Start the animation loop
requestAnimationFrame(animate);
