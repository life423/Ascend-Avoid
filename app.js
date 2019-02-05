var canvas = document.getElementById('canvas'),
    ctx    = canvas.getContext('2d');

var score = 0;
// var score = document.getElementById('score');


var speedRand1 = Math.floor(Math.random() * 7) + 1;
var speedRand2 = Math.floor(Math.random() * 7) + 1; 
var speedRand3 = Math.floor(Math.random() * 7) + 1; 

while (speedRand1 ===speedRand2 || speedRand2 ===speedRand3 ||speedRand1 ===speedRand3)
{
    var speedRand1 = Math.floor(Math.random() * 7) + 1;
    var speedRand2 = Math.floor(Math.random() * 7) + 1;
    var speedRand3 = Math.floor(Math.random() * 7) + 1;
}



var sx       = 0,
    sy       = 0,
    swidth   = 40,
    sheight  = 40,
    x        = 50,
    y        = 444,
    width    = 30,
    height   = 30;

var rightPressed = false,
    leftPressed  = false,
    upPressed    = false,
    downPressed  = false;

var up    = true,
    down  = true;
    right = true;
    left  = true;

var carX1 = 100,
    carX2 = 100,
    carY1 = 315;
    carY2 = 215;
    carX3 = 100;
    carY3 = 100;
    carWidth = 60;
    carHeight = 35;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)
{
    if(e.keyCode == 39) {rightPressed = true;}
    if(e.keyCode ==37){leftPressed = true;}
    if(e.keyCode==38){upPressed = true;}
    if(e.keyCode ==40){downPressed = true;}
}

function keyUpHandler(e){
    if (e.keyCode == 39) { rightPressed = false; }
    if (e.keyCode == 37) { leftPressed = false; }
    if (e.keyCode == 38) { upPressed = false; }
    if (e.keyCode == 40) { downPressed = false; }

}



function drawBackground(){
    // ctx.fillStyle = "rgb(0,100,200)";
    // ctx.fillRect(0, 440, 670, 45);
    // ctx.fillRect(0, 220, 570, 45);

    // ctx.fillStyle = "rgb(73, 198, 229)";
    // ctx.fillRect(0, 120, 670, 45);
    // ctx.fillRect(0, 20, 670, 45);

    

    

    // ctx.beginPath();
    // ctx.moveTo(0, 395);
    // ctx.lineTo(570, 395);
    // ctx.strokeStyle = "white";
    // // ctx.setLineDash([5]);
    // ctx.strokeWidth = 2;
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.moveTo(0, 350);
    // ctx.lineTo(570, 350);
    // ctx.strokeStyle = "white";
    // ctx.setLineDash([0]);
    // ctx.strokeWidth = 4;
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.moveTo(0, 305);
    // ctx.lineTo(570, 305);
    // ctx.strokeStyle = "white";
    // ctx.setLineDash([5]);
    // ctx.strokeWidth = 2;
    // ctx.stroke();

    // ctx.fillStyle = "rgb(21, 78, 211)";
    // ctx.fillRect(0, 0, 570, 220);
    
}

function drawFrog(){
    // ctx.drawImage(frog, sx,sy,swidth,sheight,x,y,width,height);
    ctx.beginPath();
    ctx.rect(x, y, 20, 20);
    ctx.fillStyle = "white";
    ctx.fill();
}



function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawBackground();
    drawFrog();
    moveFrong();
    drawRectangle();
    requestAnimationFrame(draw);
    runOver();
    checkForWinner();

}



function moveFrong(){
    if (upPressed == true && up == true && y > 20) {
        y = y - 44;
        up = false;
    }
    if (upPressed == false) {
        up = true;
    }
    if (downPressed == true && down == true && y + height< canvas.height-45) {
        y = y + 44;
        down = false;
    }
    if (downPressed == false) {
        down = true;
    }
    if (rightPressed == true && right == true && x < 500) {
        x = x + 44;
        right = false;
    }
    if (rightPressed == false) {
        right = true;
    }
    if (leftPressed == true && left == true && x > 20) {
        x = x - 44;
        left = false;
    }
    if (leftPressed == false) {
        left = true;
    }

    
}

function drawRectangle(){
    ctx.beginPath();
    ctx.rect(carX1 , carY1, carWidth, carHeight);
    ctx.fillStyle = "#1FF2F2";
    ctx.fill();
    if(carX1<canvas.width){
        carX1 +=speedRand2;
    }
    else{
        carX1 = -100;
    }screen
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

function runOver(){

    var carsX = [carX1, carX2, carX3];
    var carsY = [carY1, carY2, carY3];

    for(i=0; i<carsX.length; i++){
        if (carsX[i] <= x +width &&
        carsX[i] <= x +width &&
        carsX[i] +carWidth >= x &&
        carsY[i] + carHeight >= y &&
        carsY[i] <y +height){
            y=488;
        }
    }

    // if(carX1 <= x +width && carX1 +carWidth>=x && carY1 + carHeight>= y && carY1 <= y+height){
    //         y=488;
    //     }
    // if (carX2 <= x + width && carX2 + carWidth >= x && carY2 + carHeight >= y && carY2 <= y + height) {
    //     y = 488;
    // }
}
    
function checkForWinner() 
{

    if(y<10)
    {
        score++;
        console.log(score);
        document.getElementById("score").innerHTML = score;
        y=488;
    }
}    


draw();