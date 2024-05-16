let readyButton = document.getElementById("readyButton");

readyButton.addEventListener("click", () => {
    // player clicks ready
    if (readyButton.className.includes("bg-red-600")) {
        readyButton.className = readyButton.className.replace(/red-500/g, "green-500");
        readyButton.className = readyButton.className.replace(/red-600/g, "green-600");
    } else {
        // player unreadies
        readyButton.className = readyButton.className.replace(/green-500/g, "red-500");
        readyButton.className = readyButton.className.replace(/green-600/g, "red-600");
    }
})

socket.on("startGame", () => {
    window.location.href = "/game";
})