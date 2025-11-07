// ---------------- GLOBAL GAME STATE ----------------
var boy = document.getElementById('boy');
var gameArea = document.getElementById('game-area');

var idleImageNumber = 0;
var runImageNumber = 0;
var jumpImageNumber = 1;

var idleInterval, runInterval, jumpInterval, backgroundInterval, boxAnimationId;

var backgroundPosition = 0;
var isRunning = false;
var isJumping = false;
var score = 0;
var boxMarginLeft = 1340;
var passedFireCount = 0;
var boyMarginTop = 327;

var currentLevel = 1;
let levelsUnlocked = { 1: true, 2: false, 3: false, 4: false, 5: false };
let savedLevel = 1;

var deadAnimationNumber = 0;
var deadImageNumber = 1;

let natureAudio = document.getElementById("nature-sound");
let jumpAudio = document.getElementById("jump-sound");
let winAudio = document.getElementById("win-sound");
let gameOverAudio = document.getElementById("gameover-sound");
let startAudio = document.getElementById("start-sound");

let soundOn = true;  // master sound toggle


// ---------------- SCREEN MANAGEMENT ----------------
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active-screen');
        s.classList.remove('level-1-bg');
    });
}

function showStartButton() {
    document.querySelector('.splash-button').style.display = 'block';
}

function showLevelSelect() {
    stopAllIntervals();
    resetGameState();
    playStartSound(); 
     playClick();
    stopTheme();   // ✅ start sound plays once
    stopNature();

    hideAllScreens();
    document.getElementById('level-select-screen').classList.add('active-screen');

    updateLevelSelectButtons();

    const continueBtn = document.getElementById('continue-button');
    continueBtn.style.display = savedLevel > 1 ? 'block' : 'none';
}

function updateLevelSelectButtons() {
    for (let i = 1; i <= 5; i++) {
        let btn = document.getElementById(`level-${i}-btn`);
        if (!btn) continue;

        if (levelsUnlocked[i]) btn.classList.remove('locked');
        else btn.classList.add('locked');
    }
}

function continueGame() {
    startLevel(savedLevel);
}


// ---------------- GAME RESET (IMPORTANT FIX) ----------------
function resetGameState() {
    stopAllIntervals();

    isRunning = false;
    isJumping = false;

    score = 0;
    passedFireCount = 0;

    boxMarginLeft = 1340;
    boyMarginTop = 327;

    boy.style.marginTop = boyMarginTop + "px";
    boy.src = "Resources/Idle (1).png";
    boy.style.display = "block";

    document.getElementById("score").innerHTML = 0;
    document.getElementById("score").style.display = "block";

    document.getElementById("win").classList.remove('visible');
    document.getElementById("end").classList.remove('visible');

    document.querySelectorAll('.box').forEach(b => b.remove());
}

function stopAllIntervals() {
    clearInterval(idleInterval);
    clearInterval(runInterval);
    clearInterval(jumpInterval);
    clearInterval(backgroundInterval);
    clearInterval(boxAnimationId);
    clearInterval(deadAnimationNumber);

    idleInterval = runInterval = jumpInterval = backgroundInterval = boxAnimationId = deadAnimationNumber = 0;
}


// ---------------- START LEVEL ----------------
function startLevel(levelNumber) {
    if (!levelsUnlocked[levelNumber]) return;
    playNature(); 
    stopAllIntervals();
    resetGameState();

    currentLevel = levelNumber;

    hideAllScreens();
    gameArea.classList.add('active-screen');

    if (levelNumber === 1) gameArea.classList.add('level-1-bg');

    idleAnimationStart();
    creatBox();
}


// ---------------- PLAYER ANIMATIONS ----------------
function idleAnimation() {
    idleImageNumber = (idleImageNumber % 10) + 1;
    boy.src = `Resources/Idle (${idleImageNumber}).png`;
}

function idleAnimationStart() {
    idleInterval = setInterval(idleAnimation, 200);
}

function runAnimation() {
    runImageNumber = (runImageNumber % 8) + 1;
    boy.src = `Resources/Run (${runImageNumber}).png`;
}

function moveBackground() {
    backgroundPosition -= 20;
    gameArea.style.backgroundPosition = backgroundPosition + "px 0";

    score++;
    document.getElementById("score").innerHTML = score;
}

function startRunAnimation() {
     playNature(); 
    clearInterval(idleInterval);

    runInterval = setInterval(runAnimation, 100);
    backgroundInterval = setInterval(moveBackground, 100);

    if (!boxAnimationId) boxAnimationId = setInterval(boxAnimation, 100);

    isRunning = true;
}

var jumpFrameNumber = 0;

function jumpAnimation() {
    jumpFrameNumber++;

    if (jumpFrameNumber <= 6) boyMarginTop -= 30;
    else if (jumpFrameNumber <= 12) boyMarginTop += 30;

    boy.style.marginTop = boyMarginTop + "px";

    jumpImageNumber = (jumpImageNumber % 12) + 1;
    boy.src = `Resources/Jump (${jumpImageNumber}).png`;

    if (jumpFrameNumber > 12) {
        clearInterval(jumpInterval);
        jumpFrameNumber = 0;
        isJumping = false;
        boyMarginTop = 327;
        boy.style.marginTop = "327px";

        if (isRunning) runInterval = setInterval(runAnimation, 100);
        else idleAnimationStart();
    }
}

function startJumpAnimation() {
    if (isJumping) return;

     playJump();  

    clearInterval(runInterval);
    clearInterval(idleInterval);

    jumpInterval = setInterval(jumpAnimation, 100);
    isJumping = true;
}


// ---------------- KEY HANDLER ----------------
function keyCheck(event) {
    let k = event.which;

    if (k === 13 && !isRunning && !isJumping) startRunAnimation();
    if (k === 32 && !isJumping) startJumpAnimation();
}


// ---------------- BARRIERS ----------------
function creatBox() {
    boxMarginLeft = 1340;

    for (let i = 0; i < 15; i++) {
        let box = document.createElement("div");
        box.className = "box";
        gameArea.appendChild(box);

        box.id = "box" + i;
        box.style.marginLeft = boxMarginLeft + "px";

        if (i < 8) boxMarginLeft += 750;
        else if (i < 12) boxMarginLeft += 500;
        else boxMarginLeft += 350;
    }
}


function boxAnimation() {
    for (let i = 0; i < 15; i++) {
        let box = document.getElementById("box" + i);
        if (!box) continue;

        let left = parseInt(box.style.marginLeft);
        left -= 25;
        box.style.marginLeft = left + "px";

        if (left < 100 && !box.passed) {
            box.passed = true;
            passedFireCount++;
        }

        if (left >= 100 && left <= 150 && boyMarginTop >= 327 && !isJumping) {
            gameOver();
            return;
        }
    }

    if (passedFireCount >= 15) levelComplete();
}


// ---------------- GAME OVER ----------------
function gameOver() {
    stopNature();       // ✅ stop running sound
    playGameOver();     // ✅ play death sound

    stopAllIntervals();

    deadAnimationNumber = setInterval(function () {
        deadImageNumber++;

        if (deadImageNumber > 10) {
            clearInterval(deadAnimationNumber);
            document.getElementById("end").classList.add("visible");
            document.getElementById("end-score").innerHTML = score;

            document.querySelectorAll('.box').forEach(b => b.style.display = "none");
        }

        boy.src = `Resources/Dead (${deadImageNumber}).png`;
    }, 100);
}
//---------------- TRY AGAIN ------------------------
function tryAgain() {
     playClick();
    stopNature();
    playNature(); 
    stopAllIntervals();
    resetGameState();
    document.getElementById("end").classList.remove("visible");
    startLevel(currentLevel);
}


// ---------------- LEVEL COMPLETE ----------------
function levelComplete() {
    stopNature();
playWin();

    stopAllIntervals();

    let nextLevel = currentLevel + 1;
    if (nextLevel <= 5) {
        levelsUnlocked[nextLevel] = true;
        savedLevel = nextLevel;
    }

    boy.style.display = "none";
    document.getElementById("score").style.display = "none";

    document.querySelectorAll('.box').forEach(b => b.style.display = "none");

    document.getElementById("win-score-value").innerText = score;
    document.getElementById("win").classList.add("visible");
}

function goToNextLevel() {
     playClick();
    let next = currentLevel + 1;
    if (next <= 5) startLevel(next);
    else showLevelSelect();
}


// ---------------- INITIALIZE ----------------
document.addEventListener('DOMContentLoaded', () => {
    hideAllScreens();
    document.getElementById('splash-screen-only').classList.add('active-screen');
    boy.style.display = 'none';
    document.getElementById("score").style.display = 'none';

    playTheme();   // ✅ play Fire Warrior theme

    setTimeout(showStartButton, 2000);
});

//---------------INFORMATION SETTINGS ----------------------
function showInfoSettings() {
    showSettings();}

//---------------ADD SOUND-------------------------------------

let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;

    let btn = document.getElementById("sound-toggle");
    if (soundEnabled) {
        btn.innerHTML = "🔊 Mute";
        // turn ON sound (if you add audio later)
    } else {
        btn.innerHTML = "🔇 Unmute";
        // turn OFF sound
    }
}
function showSettings() {
    hideAllScreens();
    document.getElementById("settings-screen").classList.add("active-screen");
}



/* --- VOLUME SLIDER --- */
function adjustVolume(v) {
    console.log("Volume:", v);
}

/* --- QUIT BUTTON --- */
function quitGame() {
    alert("Game Closed!");
}
function playNature() {
    if (soundOn) {
        natureAudio.volume = 0.60;
        natureAudio.play();
    }
}

function stopNature() {
    natureAudio.pause();
    natureAudio.currentTime = 0;
}

function playJump() {
    if (soundOn) jumpAudio.play();
}

function playWin() {
    if (soundOn) winAudio.play();
}

function playGameOver() {
    if (soundOn) gameOverAudio.play();
}

function playStartSound() {
    if (soundOn) startAudio.play();
}

/*----TOGALE SOUND-------------*/
function toggleSound() {
    soundOn = !soundOn;

    let btn = document.getElementById("sound-toggle");

    if (soundOn) {
        btn.classList.remove("off");
        btn.classList.add("on");
        btn.innerText = "ON";
        playNature();   // resume
    } else {
        btn.classList.remove("on");
        btn.classList.add("off");
        btn.innerText = "OFF";
        stopNature();   // mute
    }
}

let uiClick = document.getElementById("ui-click-sound");
let uiTheme = document.getElementById("ui-theme");

// ✅ Play button click
function playClick() {
    if (soundOn) {
        uiClick.currentTime = 0;
        uiClick.play();
    }
}

// ✅ Play Fire Warrior theme on splash screen
function playTheme() {
    if (soundOn) {
        uiTheme.volume = 0.5;
        uiTheme.play();
    }
}

function stopTheme() {
    uiTheme.pause();
    uiTheme.currentTime = 0;
}
