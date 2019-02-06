var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

var score = 0;

var speedRand1 = Math.floor(Math.random() * 7) + 1;
var speedRand2 = Math.floor(Math.random() * 7) + 1;
var speedRand3 = Math.floor(Math.random() * 7) + 1;

while (speedRand1 !== 0 && speedRand1 === speedRand2 && speedRand2 && speedRand3 && speedRand1 === speedRand3) {
    speedRand1 = Math.floor(Math.random() * 7) + 1;
    speedRand2 = Math.floor(Math.random() * 7) + 1;
    speedRand3 = Math.floor(Math.random() * 7) + 1;
}


var cars = 3;

var x = canvas.width / 2,
    y = 488,
    width = 30,
    height = 30;

var rightPressed = false,
    leftPressed = false,
    upPressed = false,
    downPressed = false;

var up   = true,
    down = true;
   right = true;
    left = true;

var carX1 = 100,
    carX2 = 100,
    carX3 = 100,
    carY1 = randomIntFromInterval(20, 450);
    carY2 = randomIntFromInterval(20, 450);
    carY3 = randomIntFromInterval(20, 450);
 carWidth = 60;
carHeight = 35;

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
        console.log(y)
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

function drawRectangles() {
    ctx.beginPath();
    ctx.rect(carX1, carY1, carWidth, carHeight);
    ctx.fillStyle = "#1FF2F2";
    ctx.fill();
    if (carX1 < canvas.width) {
        carX1 += speedRand2;
    }
    else {
        carX1 = -100;
    } screen
    ctx.beginPath();
    ctx.rect(carX2, carY2, carWidth, carHeight);
    ctx.fillStyle = "#1FF2F2";
    ctx.fill();
    if (carX2 < canvas.width + 100) {
        carX2 += speedRand1;
    }
    else {
        carX2 = -100;
    }
    ctx.beginPath();
    ctx.rect(carX3, carY3, carWidth, carHeight);
    ctx.fillStyle = "#1FF2F2";
    ctx.fill();
    if (carX3 < canvas.width + 100) {
        carX3 += speedRand3;
    }
    else {
        carX3 = -100;
    }
}

function runOver() {

    var carsX = [carX1, carX2, carX3];
    var carsY = [carY1, carY2, carY3];

    for (i = 0; i < carsX.length; i++) {
        if (carsX[i] <= x + width &&
            carsX[i] <= x + width &&
            carsX[i] + carWidth >= x &&
            carsY[i] + carHeight >= y &&
            carsY[i] < y + height) {
            score = 0;
            document.getElementById("score").innerHTML = score;
            carY1 = randomIntFromInterval(20, 450);
            carY2 = randomIntFromInterval(20, 450);
            carY3 = randomIntFromInterval(20, 450);
            speedRand1 = Math.floor(Math.random() * 7) + 1 + score;
            speedRand2 = Math.floor(Math.random() * 7 + score) + 1 + score;
            speedRand3 = Math.floor(Math.random() * 7 + score) + 1 + score;
            y = 488;
        }
    }

}

function checkForWinner() {

    if (y < 10) {
        score++;

        document.getElementById("score").innerHTML = score;
        carY1 = randomIntFromInterval(20, 450);
        carY2 = randomIntFromInterval(20, 450);
        carY3 = randomIntFromInterval(20, 450);
        if (score % 4 === 0) {
            speedRand1 = Math.floor(Math.random() * 7) + 1 + (score / 4);
            speedRand2 = Math.floor(Math.random() * 7) + 1 + (score / 4);
            speedRand3 = Math.floor(Math.random() * 7) + 1 + (score / 4);
        }

        y = 488;

    }
}

function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //drawBackground();
    drawSqaure();
    moveFrong();
    drawRectangles();
    runOver();
    checkForWinner();
}

animate();





