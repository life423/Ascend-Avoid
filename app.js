var canvas = document.getElementById('canvas'),
       ctx = canvas.getContext('2d');

var score     = 0,
    highScore = 0;

var x      = canvas.width / 2,
    y      = 488,
    width  = 30,
    height = 30;

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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//controls which key is pussed down and sets their values of up and down on and off
function keyDownHandler(e) {
    if (e.keyCode == 39) { rightPressed = true; }
    if (e.keyCode == 37) { leftPressed = true; }
    if (e.keyCode == 38) { upPressed = true; }
    if (e.keyCode == 40) { downPressed = true; }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) { rightPressed = false; }
    if (e.keyCode == 37) { leftPressed = false; }
    if (e.keyCode == 38) { upPressed = false; }
    if (e.keyCode == 40) { downPressed = false; }

}

//makes the frog move with each tap of an arrow key instead of holding down an arrow key
function moveFrong() {
    if (upPressed === true && up === true && y > 20) {
        y = y - 40;
        up = false;
    }
    if (upPressed === false) {
        up = true;
    }
    if (downPressed === true && down === true && y + height <= canvas.height - 10) {
        y = y + 40;
        down = false;
        
    }
    if (downPressed === false) {
        down = true;
    }
    if (rightPressed === true && right === true && x < 520) {
        x = x + 40;
        right = false;
    }
    if (rightPressed === false) {
        right = true;
    }
    if (leftPressed === true && left === true && x > 20) {
        x = x - 40;
        left = false;
    }
    if (leftPressed === false) {
        left = true;
    }


}

//draws the initial piece 
function drawSqaure() {

    ctx.beginPath();
    ctx.rect(x, y, 20, 20);
    ctx.fillStyle = "white";
    ctx.fill();
}

//class to produce each square
class Car {
    
    constructor(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    // method which draws the blue rectangles
    draw(){
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.z, 25);
    ctx.fillStyle = "#1FF2F2";
    ctx.fill();
    }

    //method which causes the rectanges to move across the screen to the right
    update(){
        if (this.x < canvas.width) {
            this.x += Math.floor(Math.random() * 7) + 1+ (score/5);
        }
        else {
            this.x = -100;
        }
        this.draw();

    }
}

//an array all cars get pushed into from the addCar() function 
var cars =[
    new Car(100, randomIntFromInterval(20, 450), randomIntFromInterval(40, 100)),
];

//checks if a rectange and a square are overlapping on the canvas 
function detectCollision() {
    cars.forEach(function (car) {
        if (car.x <= x + width && car.x <= x + squareWidth && car.x + squareWidth >= x && car.y + squareHeight >= y && car.y < y + squareHeight){
            score = 0;
            cars.length =1;
            document.getElementById("score").innerHTML = score;
            y = 488;
        }
        
    });
}

//checks for a winner and calls the addCar() function and changes the score
function checkForWinner() {

    if (y < 10) {
        score++;
        addCar();

        document.getElementById("score").innerHTML = score;

        y = 488;

    }
}

//generates a random number between a range
function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}


//displays the squares that it is told to create from the addCar() function
function displaySquares(){
    cars.forEach(function (car) {
        car.update();
    });
}

//adds cars based on the players score
function addCar(){
    if(score<=2){
        cars.push(new Car(100, randomIntFromInterval(20, 450), randomIntFromInterval(40, 100)))
    }
    
    
    if(score%4===0){
        cars.push(new Car(100, randomIntFromInterval(20, 450), randomIntFromInterval(40,100)))
    }
}

//updates the high score on page
function getHighScore(){
    if (score > highScore) {
        highScore = score;
        document.getElementById("highScore").innerHTML = highScore;
    }
}

//calls essential functions in an infinite animation loop 
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSqaure();
    displaySquares();
    moveFrong();
    detectCollision();
    getHighScore();
    checkForWinner();
};
animate();






