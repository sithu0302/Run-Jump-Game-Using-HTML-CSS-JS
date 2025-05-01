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
    isRunning = true;
}
var jumpFrameNumber = 0;
var boyMarginTop=327;

// Jump Animation
function jumpAnimation() {
    jumpFrameNumber++;

    // Jump up
    if (jumpFrameNumber <= 6) {
        boyMarginTop -= 20;
        boy.style.marginTop = boyMarginTop + "px";
    }

    // Fall down
    if (jumpFrameNumber > 6 && jumpFrameNumber <= 12) {
        boyMarginTop += 20;
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
}

