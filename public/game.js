let gameMenu = document.getElementById("gameMenu");

socket.on("changeView", () => {
    let currentView = gameMenu.children[0];
    switch (currentView.id) {
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
});

socket.on('gameWon', (data) => {
    const dialogBox = document.getElementById('dialogBox');
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogImage = document.getElementById('dialogImage');
    // shown early to ignore data. This is still hardcoded
    dialogBox.showModal();

    // ignores this data. WIP
    dialogTitle.textContent = data.winOrLose;
    dialogTitle.classList.add(data.color);
    dialogImage.src = data.imageUrl;

});

document.getElementById('closeDialog').onclick = () => {
    const dialogBox = document.getElementById('dialogBox');
    dialogBox.close();
    window.location.href = "/lobby";
}

function handleWriteView() {
    function disableInputs(buttonMessage) {
        let responseArea = document.getElementById("promptResponse");
        let submitButton = document.getElementById("submitResponse");
        let prompt = document.getElementById("prompt");

        // change prompt color
        prompt.className = prompt.className.replace("bg-white", "bg-gray-100");
        prompt.className += " opacity-75";

        // disable textarea
        responseArea.disabled = true;
        responseArea.className = responseArea.className.replace("bg-white", "bg-gray-100")
        responseArea.className += " opacity-75";

        // disable submit button
        submitButton.disabled = true;
        submitButton.className = submitButton.className.replace("bg-sky-400", "bg-sky-600");
        submitButton.className += " opacity-75";
        submitButton.value = buttonMessage;
    }

    if (!playing) {
        disableInputs("You Are Spectating")
        return;
    }

    let responseArea = document.getElementById("promptResponse");
    let submitButton = document.getElementById("submitResponse");

    submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        disableInputs("Response Received");
        socket.emit("submitResponse", responseArea.value);
    })

    socket.on("retrieveResponse", () => {
        if (!playing) return;
        socket.emit("submitResponse", responseArea.value);
    })
}

function handleVoteView() {
    if (!playing) return;

    function handleVoteButton(e) {
        if (e.target.tagName !== "BUTTON" || !e.target.className.includes("voteButton")) return;

        document.removeEventListener("click", handleVoteButton);
        socket.emit("submitVote", e.target.id); // send socket id of voted
    }

    document.addEventListener("click", handleVoteButton);

    socket.on("changeView", () => {
        if (!playing) return;
        document.removeEventListener("click", handleVoteButton);
    })
}

function handleResultView() {
    // for now empty, reserved for roles where there could be an veto role
}

function handleWaitView() {
    // for now empty, reserved for roles where dead players can choose someone to take down with them
}