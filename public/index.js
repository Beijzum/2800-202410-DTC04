let last10ButtonsPressed = [];
let correctSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

document.addEventListener("keyup", (e) => {
    logButtonPressed(e.key);
    if (checkSequence()) window.location.href = "memes";
});

/**
 * Checks the sequence of the last 10 buttons pressed.
 * 
 * @returns true if the last 10 buttons pressed match the correct sequence, else false
 */
function checkSequence() {
    if (last10ButtonsPressed.length < 10) return false;
    for (let i = 0; i < last10ButtonsPressed.length; i++) {
        if (last10ButtonsPressed[i] !== correctSequence[i]) return false;
    }
    return true;
}

/**
 * Handles updating the last 10 buttons pressed.
 * 
 * @param {String} key key pressed
 */
function logButtonPressed(key) {
    if (last10ButtonsPressed.length >= 10) {
        last10ButtonsPressed.shift();
        if (key === "B" || key === "A") last10ButtonsPressed.push(key.toLowerCase());
        else last10ButtonsPressed.push(key);
    }
    else last10ButtonsPressed.push(key);
}

let winsElement = document.querySelector("#wins");
let wins = winsElement.innerHTML.trim();
let userExist = document.querySelector("#userExist").innerHTML.trim();

// Convert wins to a number for comparison
wins = Number(wins);

if (wins === 0 && userExist === "false") {
    document.querySelector("#userScores").style.display = "none";
} else {
    document.querySelector("#userScores").style.display = "flex";
}

// For Main Page Lobby Music 
let indexMusic = new Audio("sfx/lobby_music_2.mp3");
indexMusic.volume = 0.3;

const musicButton = document.querySelector("#index-music");
const musicIcon = document.querySelector("#music-icon");

musicButton.addEventListener("click", () => {
    if (indexMusic.paused) {
        indexMusic.play();
        indexMusic.loop = true;
        musicIcon.src = "images/playMusicIcon.png"
    } else {
        indexMusic.pause();
        musicIcon.src = "images/muteMusicIcon.png";
    }
});

