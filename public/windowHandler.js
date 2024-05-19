var playing = true;
var socket = io("/game");

let gameNavbar = document.getElementById("gameNavbar");
let roundCounter = document.getElementById("roundCounter");
let timeDisplay = document.getElementById("timeDisplay");
let spectateMessage = document.getElementById("spectateMessage");

document.addEventListener("DOMContentLoaded", () => { socket.emit("joinGame"); });

// handlers for changing screen
socket.on("noGameRunning", (newHTML) => {
    timeDisplay.innerHTML = "No Game Found";
    document.getElementById("gameMenu").innerHTML = newHTML;
});

socket.on("changeView", (newHTML) => {
    document.getElementById("gameMenu").innerHTML = newHTML;
});


// UI element handlers
socket.on("roundUpdate", (round) => {
    roundCounter.innerHTML = `Round ${round}`;
});

socket.on("timerUpdate", (time) => {
    let seconds = Number(time.substr(2, 2));
    // if (seconds < 11 && time[0] === "0") flashNavbar(); // honestly kind of distracting, but up to you guys if you want to keep it
    timeDisplay.innerHTML = `Time Left: ${time}`;
});

socket.on("notPlaying", () => {
    playing = false;
    spectateMessage.className = spectateMessage.className.replace("hidden", "block");
})


function flashNavbar() {
    if (gameNavbar.className.includes("bg-blue-800"))
        gameNavbar.className = gameNavbar.className.replace(/blue-800/g, "red-600");
    else
        gameNavbar.className = gameNavbar.className.replace(/red-600/g, "blue-800");
}