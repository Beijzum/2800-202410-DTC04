let last8ButtonsPressed = [];
let correctSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

document.addEventListener("keyup", (e) => {
    logButtonPressed(e.key);
    if (checkSequence()) window.location.href = "memes";
});

function checkSequence() {
    if (last8ButtonsPressed.length < 8) return false;
    for (let i = 0; i < last8ButtonsPressed.length; i++) {
        if (last8ButtonsPressed[i] !== correctSequence[i]) return false;
    }
    return true;
}

function logButtonPressed(key) {
    if (last8ButtonsPressed.length > 8) {
        last8ButtonsPressed.shift();
        last8ButtonsPressed.push(key);
    } 
    else last8ButtonsPressed.push(key);
}