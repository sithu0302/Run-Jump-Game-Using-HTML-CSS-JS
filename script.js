// --- GLOBAL GAME STATE & LEVEL MANAGEMENT ---
var boy = document.getElementById('boy');
var gameArea = document.getElementById('game-area');

var idleImageNumber = 0;
var runImageNumber = 0;
var jumpImageNumber = 1;
var idleInterval, runInterval, jumpInterval, backgroundInterval, boxAnimationId = 0;

var backgroundPosition = 0;
var isRunning = false;
var isJumping = false;
var score = 0;
var boxMarginLeft = 1340;
var passedFireCount = 0;
var boyMarginTop = 327;

let currentLevel = 1;
let levelsUnlocked = { 1: true, 2: false, 3: false, 4: false, 5: false };
let savedLevel = 1;


// --- SCREEN TRANSITION FUNCTIONS ---

function hideAllScreens() {
    // This removes the .active-screen class, which coupled with the CSS fix, hides all screens.
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
        screen.classList.remove('level-1-bg', 'level-2-bg'); 
    });
}

function showStartButton() {
    const startButton = document.querySelector('.splash-button');
    if (startButton) {
        startButton.style.display = 'block'; 
    }
}

function showLevelSelect() {
    // Hide all currently active screens
    hideAllScreens();
    
    // Activate the Level Select Hub
    document.getElementById('level-select-screen').classList.add('active-screen');
    
    updateLevelSelectButtons(); 
    
    const continueBtn = document.getElementById('continue-button');
    if (savedLevel > 1) {
        continueBtn.style.display = 'block';
    } else {
        continueBtn.style.display = 'none';
    }
}

function continueGame() {
    startLevel(savedLevel);
}

function updateLevelSelectButtons() {
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`level-${i}-btn`);
        if (btn) {
            if (levelsUnlocked[i]) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }
        }
    }
}

function startLevel(levelNumber) {
    if (!levelsUnlocked[levelNumber]) {
        console.log(`Level ${levelNumber} is locked!`);
        return;
    }

    currentLevel = levelNumber;
    hideAllScreens();
    
    gameArea.classList.add('active-screen'); 
    
    if (levelNumber === 1) {
        gameArea.classList.add('level-1-bg'); 
    }
    
    // Reset game state for a new level
    score = 0;
    document.getElementById("score").innerHTML = score;
    boxMarginLeft = 1340;
    passedFireCount = 0;
    document.querySelectorAll('.box').forEach(box => box.remove()); 
    
    // Show game elements
    boy.style.display = 'block';
    document.getElementById("score").style.display = 'block';
    
    // START CORE GAME FUNCTIONS
    idleAnimationStart(); 
    creatBox();
}

// --- CORE GAME LOGIC ---

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

function runAnimation() {
    runImageNumber++;
    if (runImageNumber > 8) {
        runImageNumber = 1;
    }
    boy.src = "Resources/Run (" + runImageNumber + ").png";
}

function moveBackground() {
    backgroundPosition -= 20;
    gameArea.style.backgroundPosition = backgroundPosition + "px 0";

    score = score + 1;
    document.getElementById("score").innerHTML = score;
}

function startRunAnimation() {
    clearInterval(idleInterval);
    runInterval = setInterval(runAnimation, 100);
    
    if (currentLevel === 1) { 
        backgroundInterval = setInterval(moveBackground, 100);
    }
    
    if (boxAnimationId === 0) {
        boxAnimationId = setInterval(boxAnimation, 100);
    }
    isRunning = true;
}

var jumpFrameNumber = 0;

function jumpAnimation() {
    jumpFrameNumber++;

    if (jumpFrameNumber <= 6) {
        boyMarginTop -= 30;
        boy.style.marginTop = boyMarginTop + "px";
    }

    if (jumpFrameNumber > 6 && jumpFrameNumber <= 12) {
        boyMarginTop += 30;
        boy.style.marginTop = boyMarginTop + "px";
    }

    jumpImageNumber++;
    if (jumpImageNumber > 12) {
        jumpImageNumber = 1;
    }

    boy.src = "Resources/Jump (" + jumpImageNumber + ").png";

    if (jumpFrameNumber > 10) {
        clearInterval(jumpInterval);
        isJumping = false;
        jumpFrameNumber = 0;
        jumpImageNumber = 1;
        boyMarginTop = 327;

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

function keyCheck(event) {
    var keycode = event.which;

    if (keycode == 13 && !isRunning && !isJumping) { // Enter = Run
        startRunAnimation();
    }

    if (keycode == 32 && !isJumping) { // Space = Jump
        startJumpAnimation();
    }
}

function creatBox() {
    boxMarginLeft = 1340;
    for (var i = 0; i <= 15; i++) {
        var box = document.createElement("div");
        box.className = "box";
        gameArea.appendChild(box); 
        box.style.marginLeft = boxMarginLeft + "px";
        box.id = "box" + i;

        if (i < 8) {
            boxMarginLeft += 750;
        } else if (i >= 5 && i < 12) {
            boxMarginLeft += 500;
        } else {
            boxMarginLeft += 350;
        }
    }
}

function boxAnimation() {
    for (var i = 0; i <= 15; i++) {
        var box = document.getElementById("box" + i);
        if (box) {
            var currentMarginLeft = parseInt(getComputedStyle(box).marginLeft);
            box.style.marginLeft = (currentMarginLeft - 25) + "px";

            if (currentMarginLeft < 100 && !box.passed) {
                passedFireCount++;
                box.passed = true; 
            }

            if (currentMarginLeft >= 100 && currentMarginLeft <= 150) {
                if (boyMarginTop >= 327 && !isJumping) {
                    // Collision occurred → Game over
                    clearInterval(boxAnimationId);
                    clearInterval(jumpInterval);
                    clearInterval(runInterval);
                    clearInterval(backgroundInterval);

                    boxAnimationId = 0;
                    deadAnimationNumber = setInterval(boyDeadAnimation, 100);
                    break;
                }
            }
        }
    }

    if (passedFireCount >= 15) {
        levelComplete();
    }
}


// Dead animation
var deadAnimationNumber = 0;
var deadImageNumber = 1;

function boyDeadAnimation() {
    deadImageNumber++;

    if (deadImageNumber > 10) {
        deadImageNumber = 10;

        // Show end screen
        document.getElementById("end").classList.add("visible");
        document.getElementById("end-score").innerHTML = score;

        // Hide fire (barrier) elements
        let boxes = document.getElementsByClassName("box");
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].style.display = "none";
        }

        clearInterval(deadAnimationNumber);
    }

    boy.src = "Resources/Dead (" + deadImageNumber + ").png";
}



    function reload() {
        boxMarginLeft = 1340; // Reset barrier starting position
        location.reload();
    }
    


function levelComplete() {
    clearInterval(boxAnimationId);
    clearInterval(jumpInterval);
    clearInterval(runInterval);
    clearInterval(backgroundInterval);

    let nextLevel = currentLevel + 1;
    if (nextLevel <= 5) {
        levelsUnlocked[nextLevel] = true;
        savedLevel = nextLevel; 
    }

    boy.style.display = 'none';
    document.getElementById("score").style.display = 'none';

    // Hide all fire boxes
    let boxes = document.getElementsByClassName("box");
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].style.display = "none";
    }

    // ✅ Only show WIN screen
    document.getElementById("win").classList.add("visible");
}


function reload() {
    location.reload(); 
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    hideAllScreens();
    document.getElementById('splash-screen-only').classList.add('active-screen');
    
    boy.style.display = 'none';
    document.getElementById("score").style.display = 'none';
   
    setTimeout(showStartButton, 2000); 
});

   

