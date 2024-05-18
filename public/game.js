let gameMenu = document.getElementById("gameMenu");

socket.on("changeView", () => {
    let currentView = gameMenu.children[0];
    switch(currentView.id) {
        case "writeView":
            handleWriteView();
            break;
        case "voteView":
            handleVoteView();
            break;
        case "resultView":
            handleResultView();
            break;
        case "waitView":
            handleWaitView();
            break;
        default:
            // transitional screen, dont need to do anything
            break;
    }
});

socket.on("gameOver", () => {
    window.location.href = "/lobby";
})

function handleWriteView() {
    let responseArea = document.getElementById("promptResponse");
    let submitButton = document.getElementById("submitResponse");

    submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        responseArea.disabled = true;
        submitButton.disabled = true;
        submitButton.value = "Response Received";
        socket.emit("submitResponse", responseArea.value);
    })

    socket.on("retrieveResponse", () => {
        socket.emit("submitResponse", responseArea.value);
    })
}

function handleVoteView() {

    function handleVoteButton(e) {
        if (e.target.tagName !== "BUTTON" && e.target.className.includes("voteButton")) return;
        
        document.removeEventListener("click", handleVoteButton);
        socket.emit("submitVote", e.target.id); // send socket id of voted
    }
    
    document.addEventListener("click", handleVoteButton);

    socket.on("changeView", () => {
        document.removeEventListener("click", handleVoteButton);
    })
}

function handleResultView() {
    // for now empty, reserved for roles where there could be an veto role
}

function handleWaitView() {
    // for now empty, reserved for roles where dead players can choose someone to take down with them
}