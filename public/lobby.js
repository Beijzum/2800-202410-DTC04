let readyButton = document.getElementById("readyButton");
let navbarMessage = document.getElementById("gameNavbarMessage");

readyButton.addEventListener("click", () => {
    // player readies
    if (!isReady()) {
        readyButton.className = readyButton.className.replace(/red-500/g, "green-500");
        readyButton.className = readyButton.className.replace(/red-600/g, "green-600");
        socket.emit("ready");
    } else {
        // player unreadies
        readyButton.className = readyButton.className.replace(/green-500/g, "red-500");
        readyButton.className = readyButton.className.replace(/green-600/g, "red-600");
        navbarMessage.innerHTML = "Waiting for Game to Start...";
        socket.emit("unready");
    }
})

socket.on("updateReadyMessage", (readyMessage) => {
    if (!isReady()) return;
    navbarMessage.innerHTML = readyMessage;
});

function isReady() {
    return document.getElementById("readyButton").className.includes("bg-green-600");
}

socket.on("startGame", () => {
    console.log('asdfasdfasd');
    window.location.href = "/game";
});