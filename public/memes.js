// AUDIO CLIPS HERE

let no = new Audio("sfx/no.mp3");
let robot = new Audio("sfx/robot.mp3");
let heli = new Audio("sfx/heliAudio.mp3");
let nextGen = new Audio("sfx/suspicious.mp3");
// It's REALLY loud
heli.volume = 0.5;

// CLICK EVENT LISTENERS HERE
document.getElementById("nextGen").addEventListener("click", () => {
    nextGen.play();
});

document.getElementById("no").addEventListener("click", () => {
    no.play();
});

document.getElementById("robot").addEventListener("click", () => {
    robot.play();
});

document.getElementById("heli").addEventListener("click", () => {
    let heliImg = document.getElementById("heli");
    heliImg.src = "images/heli.gif";
    heli.play();
    setTimeout(() => {
        heliImg.src = "images/heli.png";
    }, 7500);
});