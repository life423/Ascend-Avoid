var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

var score = 0;
var x = canvas.width / 2,
    y = 488,
    width = 30,
    height = 30;

var rightPressed = false,
    leftPressed = false,
    upPressed = false,
    downPressed = false;

var up = true,
    down = true,
    right = true,
    left = true;

var squareWidth = 20;
var squareHeight = 20;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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

function moveFrong() {
    if (upPressed == true && up == true && y > 20) {
        y = y - 40;
        up = false;
    }
    if (upPressed == false) {
        up = true;
    }
    if (downPressed == true && down == true && y + height <= canvas.height - 10) {
        y = y + 40;
        down = false;

    }
    if (downPressed == false) {
        down = true;
    }
    if (rightPressed == true && right == true && x < 520) {
        x = x + 40;
        right = false;
    }
    if (rightPressed == false) {
        right = true;
    }
    if (leftPressed == true && left == true && x > 20) {
        x = x - 40;
        left = false;
    }
    if (leftPressed == false) {
        left = true;
    }


}

function drawBackground() {


    console.log("background function")

}

function drawSqaure() {

    ctx.beginPath();
    ctx.rect(x, y, 20, 20);
    ctx.fillStyle = "white";
    ctx.fill();
}
class Car {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 60, 35);
        ctx.fillStyle = "#1FF2F2";
        ctx.fill();
    }

    update() {
        if (this.x < canvas.width) {
            this.x += Math.floor(Math.random() * 7) + 1 + (score / 3);
        }
        else {
            this.x = -100;
        }
        this.draw();

    }
}

var cars = [
    new Car(100, randomIntFromInterval(20, 450)),
];


function detectCollision() {
    cars.forEach(function (car) {
        if (car.x <= x + width && car.x <= x + squareWidth && car.x + squareWidth >= x && car.y + squareHeight >= y && car.y < y + squareHeight) {
            score = 0;
            cars.length = 1;
            document.getElementById("score").innerHTML = score;
            y = 488;
        }

    });
}

function checkForWinner() {

    if (y < 10) {
        score++;
        addCar();

        document.getElementById("score").innerHTML = score;

        y = 488;

    }
}

function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}



function displaySquares() {
    for (i = 0; i < cars.length; i++) {
        cars[i].update();
    }
}


function addCar() {
    if (score % 3 === 0) {
        cars.push(new Car(100, randomIntFromInterval(20, 450)))
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSqaure();
    displaySquares();
    moveFrong();
    detectCollision();
    checkForWinner();
};

animate();






