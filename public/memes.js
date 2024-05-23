// AUDIO CLIPS HERE
let youLikeJazz = new Audio("sfx/jazz.mp3");
let no = new Audio("sfx/no.mp3");
let robot = new Audio("sfx/robot.mp3");
let heli = new Audio("sfx/heliAudio.mp3");

// CLICK EVENT LISTENERS HERE
document.getElementById("jazz").addEventListener("click", () => {
    youLikeJazz.play();
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