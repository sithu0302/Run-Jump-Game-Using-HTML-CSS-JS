var boy = document.getElementById('boy');
var background = document.getElementById('background');

var idleImageNumber = 0;
var runImageNumber = 0;
var jumpImageNumber = 1;

var idleInterval;
var runInterval;
var jumpInterval;
var backgroundInterval;

var backgroundPosition = 0;

var isRunning = false;
var isJumping = false;

// Idle Animation
function idleAnimation() {
    idleImageNumber++;
    if (idleImageNumber > 10) {
        idleImageNumber = 1;
    }
    boy.src = "Resources/Idle (" + idleImageNumber + ").png";
}

function idleAnimationStart() {
    idleInterval = setInterval(idleAnimation, 200);
}

// Run Animation
function runAnimation() {
    runImageNumber++;
    if (runImageNumber > 8) {
        runImageNumber = 1;
    }
    boy.src = "Resources/Run (" + runImageNumber + ").png";
}

// Move Background
function moveBackground() {
    backgroundPosition -= 20;
    background.style.backgroundPosition = backgroundPosition + "px 0";
}

function startRunAnimation() {
    clearInterval(idleInterval);
    runInterval = setInterval(runAnimation, 100);
    backgroundInterval = setInterval(moveBackground, 100);

    if (boxAnimationId === 0) {
        boxAnimationId = setInterval(boxAnimation, 100);
    }
    isRunning = true;

    
}
var jumpFrameNumber = 0;
var boyMarginTop=327;

// Jump Animation
function jumpAnimation() {
    jumpFrameNumber++;

    // Jump up
    if (jumpFrameNumber <= 6) {
        boyMarginTop -= 30;
        boy.style.marginTop = boyMarginTop + "px";
    }

    // Fall down
    if (jumpFrameNumber > 6 && jumpFrameNumber <= 12) {
        boyMarginTop += 30;
        boy.style.marginTop = boyMarginTop + "px";
    }

    // Change jump image
    jumpImageNumber++;
    if (jumpImageNumber > 10) {
        jumpImageNumber = 1;
    }

    boy.src = "Resources/Jump (" + jumpImageNumber + ").png";

    // End jump
    if (jumpFrameNumber > 12) {
        clearInterval(jumpInterval);
        isJumping = false;
        jumpFrameNumber = 0;
        jumpImageNumber = 1;
        boyMarginTop = 327; // Reset position

        if (isRunning) {
            runInterval = setInterval(runAnimation, 100);
        } else {
            idleAnimationStart();
        }
    }
}

function startJumpAnimation() {
    clearInterval(idleInterval);
    clearInterval(runInterval);
    jumpFrameNumber = 0;
    jumpImageNumber = 1;
    jumpInterval = setInterval(jumpAnimation, 100);
    isJumping = true;
}

// Key Press Handler
function keyCheck(event) {
    var keycode = event.which;

    if (keycode == 13 && !isRunning && !isJumping) { // Enter = Run
        startRunAnimation();
    }

    if (keycode == 32 && !isJumping) { // Space = Jump
        startJumpAnimation();
    }
  if(boxAnimation==0){
        boxAnimationId=setInterval(boxAnimation,100);
}}

// Make Barriers

var boxMarginLeft=1040;

function creatBox(){

    for (var i = 0; i <= 20; i++) {


    var box= document.createElement("div");
    box.className="box";
    document.getElementById("background").appendChild(box);
    box.style.marginLeft=boxMarginLeft + "px";
    box.id = "box" + i;
    //boxMarginLeft=boxMarginLeft+500;

    
    if (i < 5) {
        boxMarginLeft += 750;
    } else if (i >= 5 && i < 15) {
        boxMarginLeft += 500;
    } else {
        boxMarginLeft += 500;
    }
}
}

var boxAnimationId=0;
function boxAnimation() {
    for (var i = 0; i <= 20; i++) {
      var box = document.getElementById("box" + i);
      if (box) {
        var currentMarginLeft = parseInt(getComputedStyle(box).marginLeft);
        box.style.marginLeft = (currentMarginLeft - 20) + "px";
      }
   // Collision check
if (currentMarginLeft >= -10 && currentMarginLeft <= 10) {
    if (boyMarginTop > 300) {
        // Boy didn’t jump → Game Over
        clearInterval(boxAnimationId);
        clearInterval(jumpInterval);
        clearInterval(runInterval);
        clearInterval(backgroundInterval);

        boxAnimationId = 0;
        runInterval = 0;
        backgroundInterval = 0;

        alert("Game Over! You hit the fire.");
    } else {
        // Boy jumped over the fire → Nothing happens
        console.log("Safe Jump!");
    }
}

}
}