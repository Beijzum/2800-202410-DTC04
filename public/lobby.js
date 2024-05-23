var ready = false;
let readyButton = document.getElementById("readyButton");
let navbarMessage = document.getElementById("gameNavbarMessage");

readyButton.addEventListener("click", () => {
    // player readies
    if (!ready) {
        // switch background color
        readyButton.className = readyButton.className.replace(/sky-700/g, "zinc-200");
        // switch hover background color
        readyButton.className = readyButton.className.replace(/sky-600/g, "zinc-100");
        // switch border color
        readyButton.className = readyButton.className.replace(/sky-500/g, "zinc-400");
        // switch hover border color
        readyButton.className = readyButton.className.replace(/sky-400/g, "zinc-300");
        readyButton.className = readyButton.className.replace("text-white", "text-gray-700");
        readyButton.innerHTML = "Unready";
        ready = true;
        socket.emit("ready");
    } else {
        // undo all the changes did when ready was pressed
         // switch background color
         readyButton.className = readyButton.className.replace(/zinc-200/g, "sky-700");
         // switch hover background color
         readyButton.className = readyButton.className.replace(/zinc-100/g, "sky-600");
         // switch border color
         readyButton.className = readyButton.className.replace(/zinc-400/g, "sky-500");
         // switch hover border color
         readyButton.className = readyButton.className.replace(/zinc-300/g, "sky-400");
         readyButton.className = readyButton.className.replace("text-gray-700", "text-white");
         readyButton.innerHTML = "Ready";
         navbarMessage.innerHTML = "Waiting for Game to Start...";
         ready = false;
        socket.emit("unready");
    }
})

socket.on("updateReadyMessage", (readyMessage) => {
    if (!ready) return;
    navbarMessage.innerHTML = readyMessage;
});

socket.on("startGame", () => {
    socket.emit("forceJoin");
    window.location.href = "/game";
});