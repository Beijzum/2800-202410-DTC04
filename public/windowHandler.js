var playing = true;
var socket = io("/game");
var gameReady = false, socketAssigned = false;

let gameNavbar = document.getElementById("gameNavbar");
let roundCounter = document.getElementById("roundCounter");
let timeDisplay = document.getElementById("timeDisplay");
let statusBar = document.getElementById("statusMenu");

// handler for joining game
socket.on("gameReady", () => {
    gameReady = true;
    if (gameReady && socketAssigned) socket.emit("joinGame");
});

socket.on("idAssigned", () => {
    socketAssigned = true;
    if (gameReady && socketAssigned) socket.emit("joinGame");
});

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
    let currentView = document.getElementById("gameMenu").children[0]?.id;
    if (currentView === "writeView" || currentView === "voteView") {
        let seconds = Number(time.substr(2, 2));
        if (seconds <= 10 && Number(time[0]) === 0) 
            timeDisplay.className = timeDisplay.className.replace("text-white", "text-red-500");
    } else timeDisplay.className = timeDisplay.className.replace("text-red-500", "text-white");
    
    timeDisplay.innerHTML = `Time Left: ${time}`;
});

socket.on("updateStatus", (newHTML) => {
    statusBar.innerHTML = newHTML;
})

socket.on("notPlaying", () => {
    playing = false;
})
