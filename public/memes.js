// AUDIO CLIPS HERE
let youLikeJazz = new Audio("sfx/jazz.mp3");
let no = new Audio("sfx/no.mp3");

// CLICK EVENT LISTENERS HERE
document.getElementById("jazz").addEventListener("click", () => {
    youLikeJazz.play();
});

document.getElementById("no").addEventListener("click", () => {
    no.play();
});