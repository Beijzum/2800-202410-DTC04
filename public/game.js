let gameMenu = document.getElementById("gameMenu");
// let winSound = new Audio("sfx/gameWin.mp3")
// let loseSound = new Audio("sfx/gameLose.mp3")

socket.on("idAssigned", () => {
    socket.emit("joinGame");
});

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

socket.on('gameWin', () => {
    // winSound.play();
    document.getElementById('dialogBoxWin').showModal();
});

socket.on('gameLose', () => {
    // loseSound.play();
    document.getElementById('dialogBoxLose').showModal();
});

document.getElementsByClassName('closeDialog')[0].onclick = () => {
    document.getElementById('dialogBoxWin').close();
    window.location.href = "/lobby";
};

document.getElementsByClassName('closeDialog')[1].onclick = () => {
    document.getElementById('dialogBoxLose').close();
    window.location.href = "/lobby";
};

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
        responseArea.className = responseArea.className.replace("bg-white", "bg-gray-100");
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

    let voted = false;
    let selected = false;
    let responseCards = document.querySelectorAll(".responseCard");

    responseCards.forEach((card) => {

        let buttonsDiv = card.children[0].children[1];
        let voteButton = buttonsDiv.children[0];
        let cancelButton = buttonsDiv.children[1];

        function hideButtons(boolean) {
            if (boolean)
                buttonsDiv.className = buttonsDiv.className.replace("opacity-100", "opacity-0");
            else
                buttonsDiv.className = buttonsDiv.className.replace("opacity-0", "opacity-100");
            voteButton.disabled = boolean;
            cancelButton.disabled = boolean;
        }

        voteButton.addEventListener("click", () => {
            if (voted) return;

            voted = true;
            card.className = card.className.replace("bg-white", "bg-gray-200");
            card.className += " opacity-75";
            hideButtons(true);
            socket.emit("submitVote", card.id);
        });

        cancelButton.addEventListener("click", () => {
            selected = false;
            hideButtons(true);
        })

        card.addEventListener("click", function (e) {
            if (voted || e.target === cancelButton || selected) return;
            hideButtons(false);
            selected = true;
        });
    });
}

function handleResultView() {
    // for now empty, reserved for roles where there could be an veto role
}

function handleWaitView() {
    // for now empty, reserved for roles where dead players can choose someone to take down with them
}